import { AppError } from "@/middleware/errorHandler";
import { aiService } from "@/services/aiService";
import { logger } from "@/utils/logger";
import { prisma } from "@signal-watcher/database";
import { CreateEventSchema } from "@signal-watcher/shared";
import { Request, Response, Router } from "express";

const router: Router = Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     parameters:
 *       - in: query
 *         name: watchlistId
 *         schema:
 *           type: string
 *         description: Filter events by watchlist ID
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MED, HIGH, CRITICAL]
 *         description: Filter events by severity
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const { watchlistId, severity } = req.query;

  try {
    const events = await prisma.event.findMany({
      where: {
        ...(watchlistId && { watchlistId: watchlistId as string }),
        ...(severity && { aiSeverity: severity as any }),
      },
      include: {
        watchlist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    logger.info("Events retrieved", {
      count: events.length,
      filters: { watchlistId, severity },
      correlationId,
    });

    res.json({
      success: true,
      data: events,
      correlationId,
    });
  } catch (error) {
    logger.error("Error retrieving events", { error, correlationId });
    throw new AppError("Failed to retrieve events", 500);
  }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event (simulate security event)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "suspicious_domain"
 *               description:
 *                 type: string
 *                 example: "New suspicious domain detected: malicious-site.com"
 *               metadata:
 *                 type: object
 *                 example: {"domain": "malicious-site.com", "ip": "192.168.1.100"}
 *               watchlistId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created and analyzed
 */
router.post("/", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;

  try {
    const validation = CreateEventSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError("Invalid request data", 400);
    }

    const { type, description, metadata = {}, watchlistId } = validation.data;

    // Verify watchlist exists
    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!watchlist) {
      throw new AppError("Watchlist not found", 404);
    }

    // Create event first
    const event = await prisma.event.create({
      data: {
        type,
        description,
        metadata: JSON.stringify(metadata),
        watchlistId,
      },
    });

    // Trigger AI analysis asynchronously
    setImmediate(async () => {
      try {
        const analysis = await aiService.analyzeEvent(
          type,
          description,
          metadata,
          JSON.parse(watchlist.terms),
          correlationId
        );

        // Update event with AI analysis
        await prisma.event.update({
          where: { id: event.id },
          data: {
            aiSummary: analysis.summary,
            aiSeverity: String(analysis.severity),
            aiSuggestedAction: analysis.suggestedAction,
            aiProcessedAt: new Date(),
          },
        });

        logger.info("Event analyzed by AI", {
          eventId: event.id,
          severity: analysis.severity,
          correlationId,
        });
      } catch (error) {
        logger.error("AI analysis failed for event", {
          eventId: event.id,
          error,
          correlationId,
        });
      }
    });

    logger.info("Event created", {
      eventId: event.id,
      type,
      watchlistId,
      correlationId,
    });

    res.status(201).json({
      success: true,
      data: event,
      message: "Event created, AI analysis in progress",
      correlationId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating event", { error, correlationId });
    throw new AppError("Failed to create event", 500);
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 */
router.get("/:id", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        watchlist: true,
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    res.json({
      success: true,
      data: event,
      correlationId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error retrieving event", {
      error,
      eventId: id,
      correlationId,
    });
    throw new AppError("Failed to retrieve event", 500);
  }
});

/**
 * @swagger
 * /api/events/simulate:
 *   post:
 *     summary: Simulate multiple security events for testing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               watchlistId:
 *                 type: string
 *               count:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 3
 *     responses:
 *       201:
 *         description: Events simulated successfully
 */
router.post("/simulate", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const { watchlistId, count = 3 } = req.body;

  try {
    if (!watchlistId) {
      throw new AppError("Watchlist ID is required", 400);
    }

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!watchlist) {
      throw new AppError("Watchlist not found", 404);
    }

    const simulatedEvents = [
      {
        type: "suspicious_domain",
        description: "New suspicious domain detected: malicious-example.com",
        metadata: {
          domain: "malicious-example.com",
          ip: "192.168.1.100",
          registrar: "unknown",
        },
      },
      {
        type: "phishing_attempt",
        description: "Phishing email detected with suspicious links",
        metadata: {
          sender: "attacker@fake-bank.com",
          recipients: 5,
          blocked: true,
        },
      },
      {
        type: "malware_detection",
        description: "Malware signature detected in network traffic",
        metadata: {
          signature: "Trojan.Generic.KD.123456",
          severity: "high",
          source_ip: "10.0.0.5",
        },
      },
      {
        type: "unusual_activity",
        description: "Unusual login activity detected from foreign IP",
        metadata: {
          user: "admin@company.com",
          ip: "203.0.113.1",
          country: "Unknown",
          time: "02:30 AM",
        },
      },
      {
        type: "data_exfiltration",
        description: "Large data transfer detected to external server",
        metadata: {
          bytes: 500000000,
          destination: "198.51.100.5",
          protocol: "HTTPS",
        },
      },
    ];

    const eventsToCreate = simulatedEvents.slice(
      0,
      Math.min(count, simulatedEvents.length)
    );
    const createdEvents = [];

    for (const eventData of eventsToCreate) {
      const event = await prisma.event.create({
        data: {
          type: eventData.type,
          description: eventData.description,
          metadata: JSON.stringify(eventData.metadata),
          watchlistId,
        },
      });
      createdEvents.push(event);

      // Trigger AI analysis
      setImmediate(async () => {
        try {
          const analysis = await aiService.analyzeEvent(
            eventData.type,
            eventData.description,
            eventData.metadata,
            JSON.parse(watchlist.terms),
            correlationId
          );

          await prisma.event.update({
            where: { id: event.id },
            data: {
              aiSummary: analysis.summary,
              aiSeverity: String(analysis.severity),
              aiSuggestedAction: analysis.suggestedAction,
              aiProcessedAt: new Date(),
            },
          });
        } catch (error) {
          logger.error("AI analysis failed for simulated event", {
            eventId: event.id,
            error,
            correlationId,
          });
        }
      });
    }

    logger.info("Events simulated", {
      count: createdEvents.length,
      watchlistId,
      correlationId,
    });

    res.status(201).json({
      success: true,
      data: createdEvents,
      message: `${createdEvents.length} events simulated successfully`,
      correlationId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error simulating events", { error, correlationId });
    throw new AppError("Failed to simulate events", 500);
  }
});

export { router };
