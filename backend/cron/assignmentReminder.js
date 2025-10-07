import cron from "node-cron";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import sendMail from "../utils/sendMail.js";

// Runs once every hour
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();

    // Two reminder schedules: 24 hrs and 12 hrs before deadline
    const reminderWindows = [
      { label: "24-hour", offsetHours: 24 },
      { label: "12-hour", offsetHours: 12 },
    ];

    for (let { label, offsetHours } of reminderWindows) {
      const reminderTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);

      // Find assignments due roughly around the reminder time (within 1 hour)
      const assignments = await Assignment.find({
        deadline: {
          $gte: reminderTime,
          $lt: new Date(reminderTime.getTime() + 60 * 60 * 1000),
        },
      }).populate("downloads");

      for (let assignment of assignments) {
        for (let studentId of assignment.downloads) {
          const student = await User.findById(studentId);
          if (!student) continue;

          // ✅ Prevent duplicate mails for same reminder type
          if (!assignment.remindersSent) assignment.remindersSent = [];
          const alreadySent = assignment.remindersSent.find(
            (r) => r.studentId.toString() === studentId.toString() && r.type === label
          );
          if (alreadySent) continue;

          console.log(
            `📩 Sending ${label} reminder mail to ${student.email} for assignment ${assignment.assignmentNo}`
          );

          const subject = `⏰ Reminder: Assignment "${assignment.subject}" due soon`;

          const body = `
Hi ${student.name},

This is a friendly reminder that your assignment ${assignment.assignmentNo} of **"${assignment.subject}  "** is due soon.

🕓 Deadline: ${new Date(assignment.deadline).toLocaleString()}

If you haven’t submitted it yet, please make sure to do so **by tomorrow** to avoid missing the deadline.
Submitting early helps you avoid last-minute rushes and gives time to review your work carefully.

A few quick tips to stay on track:
- Recheck the requirements once more.
- Review your uploaded file for completeness.
- Take a short break, then proofread your final submission.

Your consistency and dedication are commendable — keep up the great work! 🌟

Warm regards,  
AceStudy Team
          `;

          await sendMail(student.email, subject, body);

          // Optional: Add an in-app notification
          student.notifications.push({
            message: `Reminder: Your assignment "${assignment.subject} - ${assignment.assignmentNo}" is due soon! Submit it by tomorrow.`,
          });
          await student.save();

          // ✅ Mark reminder as sent
          assignment.remindersSent.push({
            studentId,
            type: label,
            sentAt: new Date(),
          });
          await assignment.save();
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in assignment reminder cron:", error);
  }
});
