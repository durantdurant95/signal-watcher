import { AppError } from "@/middleware/errorHandler";
import { logger } from "@/utils/logger";
import { prisma } from "@signal-watcher/database";
import {
  CreateWatchlistSchema,
  UpdateWatchlistSchema,
} from "@signal-watcher/shared";
import { Request, Response, Router } from "express";

const router: Router = Router();

/**
 * @swagger
 * /api/watchlists:
 *   get:
 *     summary: Get all watchlists
 *     responses:
 *       200:
 *         description: List of watchlists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Watchlist'
 */
router.get("/", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;

  try {
    const watchlists = await prisma.watchlist.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    logger.info("Watchlists retrieved", {
      count: watchlists.length,
      correlationId,
    });

    res.json({
      success: true,
      data: watchlists,
      correlationId,
    });
  } catch (error) {
    logger.error("Error retrieving watchlists", { error, correlationId });
    throw new AppError("Failed to retrieve watchlists", 500);
  }
});

/**
 * @swagger
 * /api/watchlists:
 *   post:
 *     summary: Create a new watchlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               terms:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Watchlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Watchlist'
 */
router.post("/", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;

  try {
    const validation = CreateWatchlistSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError("Invalid request data", 400);
    }

    const { name, description, terms } = validation.data;

    const watchlist = await prisma.watchlist.create({
      data: {
        name,
        description,
        terms: JSON.stringify(terms),
      },
    });

    logger.info("Watchlist created", {
      watchlistId: watchlist.id,
      name,
      correlationId,
    });

    res.status(201).json({
      success: true,
      data: watchlist,
      correlationId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error creating watchlist", { error, correlationId });
    throw new AppError("Failed to create watchlist", 500);
  }
});

/**
 * @swagger
 * /api/watchlists/{id}:
 *   get:
 *     summary: Get watchlist by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watchlist details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Watchlist'
 */
router.get("/:id", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const { id } = req.params;

  try {
    const watchlist = await prisma.watchlist.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!watchlist) {
      throw new AppError("Watchlist not found", 404);
    }

    res.json({
      success: true,
      data: watchlist,
      correlationId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error retrieving watchlist", {
      error,
      watchlistId: id,
      correlationId,
    });
    throw new AppError("Failed to retrieve watchlist", 500);
  }
});

/**
 * @swagger
 * /api/watchlists/{id}:
 *   put:
 *     summary: Update watchlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               terms:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Watchlist updated successfully
 */
router.put("/:id", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const { id } = req.params;

  try {
    const validation = UpdateWatchlistSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError("Invalid request data", 400);
    }

    const updateData: any = {
      ...validation.data,
    };

    if (validation.data.terms) {
      updateData.terms = Array.isArray(validation.data.terms)
        ? JSON.stringify(validation.data.terms)
        : validation.data.terms;
    }

    const watchlist = await prisma.watchlist.update({
      where: { id },
      data: updateData,
    });

    logger.info("Watchlist updated", {
      watchlistId: id,
      correlationId,
    });

    res.json({
      success: true,
      data: watchlist,
      correlationId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Error updating watchlist", {
      error,
      watchlistId: id,
      correlationId,
    });
    throw new AppError("Failed to update watchlist", 500);
  }
});

/**
 * @swagger
 * /api/watchlists/{id}:
 *   delete:
 *     summary: Delete watchlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Watchlist deleted successfully
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId;
  const { id } = req.params;

  try {
    await prisma.watchlist.delete({
      where: { id },
    });

    logger.info("Watchlist deleted", {
      watchlistId: id,
      correlationId,
    });

    res.json({
      success: true,
      message: "Watchlist deleted successfully",
      correlationId,
    });
  } catch (error) {
    logger.error("Error deleting watchlist", {
      error,
      watchlistId: id,
      correlationId,
    });
    throw new AppError("Failed to delete watchlist", 500);
  }
});

export { router };
