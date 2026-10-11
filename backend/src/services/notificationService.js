import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { Notification } from '../models/Notification.js';

export class NotificationService {
  /**
   * Helper to send real SMS via Twilio REST API
   */
  static async sendTwilioSms(toPhone, messageBody) {
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      return null;
    }

    // Ensure phone number has clean international E.164 format (e.g. +916385122853 without spaces)
    const digitsOnly = toPhone.replace(/\D/g, '');
    const formattedTo = toPhone.trim().startsWith('+') ? `+${digitsOnly}` : (digitsOnly.startsWith('91') ? `+${digitsOnly}` : `+91${digitsOnly}`);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`;
    const basicAuth = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('To', formattedTo);
    params.append('From', config.twilioPhoneNumber);
    params.append('Body', messageBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Twilio error code ${data.code || response.status}`);
    }

    return data;
  }

  /**
   * Dispatches emergency alert to a list of trusted contacts
   * @param {Object} incident 
   * @param {Array} contacts 
   * @param {Object} user 
   * @returns {Promise<Array>} Results for each contact
   */
  static async sendEmergencyAlerts(incident, contacts, user) {
    const results = [];
    const locationText = incident.latestLocation && incident.latestLocation.latitude
      ? `Location: https://maps.google.com/?q=${incident.latestLocation.latitude},${incident.latestLocation.longitude}`
      : 'Location: Coordinates pending';

    const alertMessage = `EMERGENCY SOS ALERT: ${user.fullName} triggered Women Safety Shield! ${locationText}. Incident: ${incident.incidentId}. Call 112 if immediate assistance is needed.`;

    const isTest = process.env.NODE_ENV === 'test';
    const hasTwilio = Boolean(config.twilioAccountSid && config.twilioAuthToken && config.twilioPhoneNumber);

    for (const contact of contacts) {
      const channel = contact.preferredNotifyMethod || 'sms';

      try {
        if (!isTest && hasTwilio && (channel === 'sms' || channel === 'whatsapp' || channel === 'call')) {
          // Send real SMS via Twilio
          logger.emergency(`[TWILIO] Sending real SOS SMS to ${contact.name} (${contact.phoneNumber})...`);
          const twilioResult = await this.sendTwilioSms(contact.phoneNumber, alertMessage);

          results.push({
            contactId: contact._id,
            name: contact.name,
            phone: contact.phoneNumber,
            channel: 'sms',
            status: 'sent',
            sentAt: new Date(),
            deliveredAt: twilioResult.date_sent ? new Date(twilioResult.date_sent) : new Date(),
          });
          logger.info(`[TWILIO] Message delivered to Twilio queue: SID ${twilioResult.sid}`);
        } else {
          // Development Adapter (or Test Mode)
          logger.emergency(`[DEV NOTIFICATION ADAPTER] Dispatching simulated SOS SMS to ${contact.name} (${contact.phoneNumber})`, {
            message: alertMessage,
            incidentId: incident.incidentId,
          });

          results.push({
            contactId: contact._id,
            name: contact.name,
            phone: contact.phoneNumber,
            channel,
            status: 'sent',
            sentAt: new Date(),
            deliveredAt: new Date(),
          });
        }
      } catch (err) {
        logger.error(`Failed to send alert to ${contact.name} (${contact.phoneNumber}): ${err.message}`);
        results.push({
          contactId: contact._id,
          name: contact.name,
          phone: contact.phoneNumber,
          channel,
          status: 'failed',
          errorMessage: err.message,
        });
      }
    }

    // Persist in-app system notification for user audit
    await Notification.create({
      userId: user._id,
      title: 'SOS Emergency Activated',
      message: `Emergency SOS triggered. ${contacts.length} trusted contacts alerted.`,
      type: 'emergency',
      metadata: { incidentId: incident.incidentId },
    }).catch((err) => logger.error(`In-app notification save failed: ${err.message}`));

    return results;
  }

  /**
   * Dispatches Safe Journey escalation alert when a check-in is critically missed
   */
  static async sendJourneyEscalationAlert(journey, contacts, user) {
    const results = [];
    const locationText = journey.lastKnownLocation && journey.lastKnownLocation.latitude
      ? `Last location: https://maps.google.com/?q=${journey.lastKnownLocation.latitude},${journey.lastKnownLocation.longitude}`
      : 'Last location: Not reported';

    const alertMsg = `SAFETY NOTICE: ${user.fullName} missed scheduled check-in towards "${journey.destination.name}". ${locationText}. Please check on them.`;

    const isTest = process.env.NODE_ENV === 'test';
    const hasTwilio = Boolean(config.twilioAccountSid && config.twilioAuthToken && config.twilioPhoneNumber);

    for (const contact of contacts) {
      try {
        if (!isTest && hasTwilio) {
          await this.sendTwilioSms(contact.phoneNumber, alertMsg);
        } else {
          logger.warn(`[DEV ADAPTER] Safe journey escalation notice logged for ${contact.name} (${contact.phoneNumber})`);
        }

        results.push({
          contactId: contact._id,
          name: contact.name,
          phone: contact.phoneNumber,
          status: 'sent',
          sentAt: new Date(),
        });
      } catch (err) {
        logger.error(`Escalation SMS error for ${contact.phoneNumber}: ${err.message}`);
        results.push({
          contactId: contact._id,
          name: contact.name,
          phone: contact.phoneNumber,
          status: 'failed',
          errorMessage: err.message,
        });
      }
    }

    await Notification.create({
      userId: user._id,
      title: 'Safe Journey Check-in Overdue',
      message: `Check-in overdue for journey to ${journey.destination.name}. Contacts notified.`,
      type: 'journey',
      metadata: { journeyId: journey.journeyId },
    }).catch((err) => logger.error(`Journey notification save failed: ${err.message}`));

    return results;
  }
}
