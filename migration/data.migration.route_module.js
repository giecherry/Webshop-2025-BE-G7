import express from 'express';
import fs from 'fs';
import { adminAuth } from '../src/middleware/auth.js';

/**
 * Creates a router for data migration operations
 * @param {mongoose.Model} Model - The Mongoose model to perform operations on
 * @param {string} dataPath - Path to the JSON data file
 * @returns {express.Router} Router with migration endpoints
 */
export default function dataMigrationRouter(Model, dataPath) {
  const router = express.Router();
  
  // Migrate data endpoint - Admin only
  router.post('/migrate', adminAuth, async (req, res) => {
    try {
      // Read data from JSON file
      const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const results = {
        created: 0,
        updated: 0,
        failed: 0,
        errors: []
      };

      // Process each item in the data
      for (const item of jsonData) {
        try {
          if (item._id) {
            // If item has an ID, try to update existing or create new
            const existingItem = await Model.findById(item._id);
            if (existingItem) {
              await Model.findByIdAndUpdate(item._id, item);
              results.updated++;
            } else {
              await new Model(item).save();
              results.created++;
            }
          } else {
            // Create new document if no ID specified
            await new Model(item).save();
            results.created++;
          }
        } catch (itemError) {
          results.failed++;
          results.errors.push({
            item,
            error: itemError.message
          });
        }
      }

      res.status(200).json({
        message: `Migration completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
        results
      });
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({
        error: 'Migration failed',
        details: error.message
      });
    }
  });

  // Teardown (remove all data) endpoint - Admin only
  router.delete('/teardown', adminAuth, async (req, res) => {
    try {
      const result = await Model.deleteMany({});
      res.status(200).json({
        message: `Successfully removed ${result.deletedCount} documents`,
        result
      });
    } catch (error) {
      console.error('Teardown error:', error);
      res.status(500).json({
        error: 'Teardown failed',
        details: error.message
      });
    }
  });

  return router;
} 