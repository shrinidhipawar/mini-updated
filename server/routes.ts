import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSubmissionSchema,
  insertLogSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check user role
  const checkRole = (role: string) => (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };
  
  // Protected routes for students
  app.get("/api/student/dashboard", isAuthenticated, checkRole("student"), (req, res) => {
    res.json({ message: "Student dashboard" });
  });
  
  // Protected routes for admins
  app.get("/api/admin/dashboard", isAuthenticated, checkRole("admin"), (req, res) => {
    res.json({ message: "Admin dashboard" });
  });
  
  // Code submissions endpoint
  app.post("/api/submit", isAuthenticated, async (req, res) => {
    try {
      const submission = insertSubmissionSchema.parse({
        userId: req.user.id,
        subject: req.body.subject,
        code: req.body.code
      });
      
      const result = await storage.createSubmission(submission);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit code" });
      }
    }
  });
  
  // Get all submissions (admin only)
  app.get("/api/submissions", isAuthenticated, checkRole("admin"), async (req, res) => {
    const submissions = await storage.getSubmissions();
    res.json(submissions);
  });
  
  // Get user's submissions
  app.get("/api/submissions/user", isAuthenticated, async (req, res) => {
    const submissions = await storage.getSubmissionsByUserId(req.user.id);
    res.json(submissions);
  });
  
  // Logging endpoints
  // Tab switch logging
  app.post("/api/log/tab-switch", isAuthenticated, async (req, res) => {
    try {
      const log = insertLogSchema.parse({
        userId: req.user.id,
        type: "tab-switch",
        data: JSON.stringify(req.body)
      });
      
      const result = await storage.createLog(log);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });
  
  // Screenshot logging
  app.post("/api/log/screenshot", isAuthenticated, async (req, res) => {
    try {
      const log = insertLogSchema.parse({
        userId: req.user.id,
        type: "screenshot",
        data: req.body.image
      });
      
      const result = await storage.createLog(log);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });
  
  // Screen share logging
  app.post("/api/log/screen-share", isAuthenticated, async (req, res) => {
    try {
      const log = insertLogSchema.parse({
        userId: req.user.id,
        type: "screen-share",
        data: JSON.stringify(req.body)
      });
      
      const result = await storage.createLog(log);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });
  
  // Get all logs (admin only)
  app.get("/api/logs", isAuthenticated, checkRole("admin"), async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });
  
  // Get logs by type (admin only)
  app.get("/api/logs/type/:type", isAuthenticated, checkRole("admin"), async (req, res) => {
    const logs = await storage.getLogsByType(req.params.type);
    res.json(logs);
  });

  const httpServer = createServer(app);
  return httpServer;
}
