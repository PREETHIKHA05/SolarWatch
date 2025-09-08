import clientPromise from "@/lib/mongo";
import { AlertSystem } from "@/lib/alert-system";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const alertSystem = AlertSystem.getInstance();

    if (req.method === 'GET') {
      const { buildingId, acknowledged, severity } = req.query;
      
      // Get alerts from database
      let query = {};
      if (buildingId) query.buildingId = buildingId;
      if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';
      if (severity) query.severity = severity;

      const alerts = await db.collection("alerts")
        .find(query)
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      // Also get in-memory alerts from AlertSystem
      const memoryAlerts = alertSystem.getAlerts(buildingId, acknowledged === 'true');
      
      // Combine and deduplicate
      const allAlerts = [...alerts, ...memoryAlerts];
      const uniqueAlerts = allAlerts.filter((alert, index, self) => 
        index === self.findIndex(a => a.id === alert.id)
      );

      const alertStats = alertSystem.getAlertStats();

      res.status(200).json({
        alerts: uniqueAlerts,
        stats: alertStats,
        total: uniqueAlerts.length
      });

    } else if (req.method === 'POST') {
      const { alertId, action } = req.body;

      if (action === 'acknowledge') {
        // Acknowledge in memory
        alertSystem.acknowledgeAlert(alertId);
        
        // Acknowledge in database
        await db.collection("alerts").updateOne(
          { id: alertId },
          { $set: { acknowledged: true, acknowledgedAt: new Date() } }
        );

        res.status(200).json({ success: true, message: 'Alert acknowledged' });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Alerts API error:', error);
    res.status(500).json({ 
      error: 'Failed to process alerts request',
      details: error.message 
    });
  }
}