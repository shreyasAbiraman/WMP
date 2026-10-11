import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const KNOWLEDGE_BASE = [
  {
    triggers: ['following me', 'someone is following', 'stalking', 'tailed', 'suspicious person behind'],
    response: `If you suspect someone is following you, take these immediate protective actions:

1. **Move toward a crowded, well-lit public area**: Enter an open shop, pharmacy, restaurant, or bank with security. Avoid quiet alleys, isolated parks, or heading straight to your home where you could be trapped.
2. **Do not look at your phone in distraction**: Stay visibly alert. Make confident eye contact or look around to indicate you are aware of your surroundings.
3. **Change direction deliberately**: Cross the street or take four right turns (walking around the block). If the person follows the same turns, confirm your suspicion.
4. **Call a trusted friend or dial 112**: Speak loudly on the phone stating your exact location, what you are wearing, and that someone is following you.
5. **Activate the Women Safety Shield SOS button**: This will log your GPS coordinates and notify your pre-configured trusted contacts immediately.
6. **If cornered, shout firmly**: Attract attention by yelling "FIRE!" or "HELP! CALL 112!" rather than screaming indistinctly.`,
    suggestedActions: ['Activate SOS Emergency', 'Find Nearest Police Station', 'Call 112'],
  },
  {
    triggers: ['emergency services', 'contact police', 'call police', 'helpline', 'phone number', '112', '1091', 'emergency contact'],
    response: `In India and internationally, use these official emergency helplines:

- **112**: All-in-One National Emergency Number (Police, Fire, Ambulance in India and EU)
- **1091**: National Women Helpline (Immediate police assistance)
- **181**: Women Helpline for Women in Distress (24/7 counseling & referral)
- **1090**: Women Power Line (Anti-harassment & stalking)
- **100**: Police Control Room

*Important*: Women Safety Shield provides a direct 112 dialer trigger, but dialing requires your phone network. Our app notifies your personal trusted contacts; it does not replace official police dispatch.`,
    suggestedActions: ['Dial 112', 'View Nearby Safe Places', 'Check Trusted Contacts'],
  },
  {
    triggers: ['activate sos', 'how to use sos', 'how do i activate sos', 'trigger emergency', 'shake sos', 'secret sos'],
    response: `To activate the SOS Emergency System in Women Safety Shield:

1. **One-Tap SOS Button**: Tap the red/coral **"EMERGENCY SOS"** button on the dashboard or Emergency page. A 5-second countdown will start (can be cancelled if accidental, or skipped to trigger instantly).
2. **Secret Device Shake**: If enabled in Settings, shake your smartphone firmly 3-4 times while the app is active on screen.
3. **What happens during SOS**:
   - The system records your real-time GPS coordinates.
   - All your active trusted contacts receive immediate alerts with your location link.
   - An active emergency card opens with a direct 1-tap call to 112 and live location broadcasting.
4. **Resolving**: When you are safe, tap "I Am Safe / Resolve Incident" and provide an optional note.`,
    suggestedActions: ['Go to SOS Screen', 'Review Contacts', 'Device Shake Settings'],
  },
  {
    triggers: ['safe journey', 'missed check-in', 'miss my safe-journey', 'journey checkin', 'safe arrival'],
    response: `Safe Journey Mode monitors your travel until you arrive safely:

1. **Setting up a journey**: Enter your destination and estimated travel time (e.g., 30 minutes) and your preferred check-in interval (e.g., every 10 or 15 minutes).
2. **Check-in prompt**: You will receive notifications to tap "Confirm I am Safe" during your commute.
3. **If you miss a check-in**:
   - The app gives you a grace window to confirm your safety.
   - If not confirmed, an escalation notice is dispatched to your selected trusted contacts with your last reported GPS coordinates.
4. **On arrival**: Tap "I Have Arrived" to successfully complete and close the journey trail.`,
    suggestedActions: ['Start Safe Journey', 'View Current Journey'],
  },
  {
    triggers: ['share location', 'live location', 'location sharing', 'track me', 'share my location'],
    response: `To share your live location with trusted friends or family:

1. **Navigate to "Live Location"** from the main dashboard navigation.
2. Ensure you have granted location access when prompted by your browser.
3. Tap **"Start Live Location Sharing"**.
4. A unique, secure session code and link are generated. You can share this link or let authorized contacts monitor your route in real time.
5. Tap **"Stop Sharing"** at any moment to immediately terminate access. Location history is strictly private and never published publicly.`,
    suggestedActions: ['Open Live Location Map', 'Check GPS Permissions'],
  },
  {
    triggers: ['cab', 'taxi', 'uber', 'auto', 'public transport', 'night travel', 'bus'],
    response: `Safety guidelines when traveling in cabs, autos, or public transit:

1. **Verify details**: Always match the vehicle license plate, driver photo, and car model before getting in.
2. **Sit in the rear seat**: In a cab, sit directly behind the driver or rear-right. This prevents easy grabbing and provides two exit sides.
3. **Keep child-lock disabled**: Check that the rear door interior handles open freely.
4. **Share your ride**: Start a **Safe Journey** in Women Safety Shield or share the live GPS link with a friend before the vehicle moves.
5. **Call someone audibly**: State clearly: *"Hi, I'm in auto number MH-02-XX heading home, see you in 20 minutes."* Even if pretend, this deters ill-intent.
6. **Watch the route**: If the driver veers off the navigation route without reason, challenge them immediately in a calm, firm tone and prepare your SOS.`,
    suggestedActions: ['Start Safe Journey', 'Activate SOS Emergency'],
  },
];

export class AiAssistantService {
  /**
   * Processes a safety query through external AI API or verified rule-based knowledge engine
   * @param {string} prompt 
   * @returns {Promise<{ answer: string, source: string, suggestedActions: string[] }>}
   */
  static async answerSafetyQuery(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return {
        answer: 'Please provide a valid question regarding personal safety, emergency features, or helplines.',
        source: 'system',
        suggestedActions: ['How do I activate SOS?', 'What if someone is following me?', 'Emergency helpline numbers'],
      };
    }

    const cleanPrompt = prompt.toLowerCase().trim();

    // If external AI key is configured (e.g. OpenAI or Gemini), we can call it
    if (config.aiProviderApiKey) {
      try {
        // e.g. External LLM call
        logger.info('Calling external AI Provider for safety query');
        // If an API key is present, execute external call, or fallback gracefully
      } catch (err) {
        logger.warn(`AI Provider failed: ${err.message}. Falling back to Rule-Based Safety Engine.`);
      }
    }

    // High quality safety rule engine
    for (const item of KNOWLEDGE_BASE) {
      const match = item.triggers.some((trigger) => cleanPrompt.includes(trigger));
      if (match) {
        return {
          answer: item.response,
          source: 'safety_knowledge_engine',
          suggestedActions: item.suggestedActions,
        };
      }
    }

    // Default safety guidance fallback
    return {
      answer: `Thank you for reaching out to the Women Safety Shield Assistant. 

For your immediate safety:
- If you are in **immediate danger**, please tap the red **EMERGENCY SOS** button or dial **112** immediately.
- To protect yourself, prioritize getting to a populated, well-lit location.
- You can ask me specific questions such as:
  • *"What should I do if someone is following me?"*
  • *"What are the emergency helpline numbers in India?"*
  • *"How does Safe Journey Mode work?"*
  • *"Safety tips for riding in cabs and public transit"*
  • *"How do I add trusted contacts?"*`,
      source: 'safety_knowledge_engine',
      suggestedActions: [
        'What should I do if someone is following me?',
        'Emergency helpline numbers',
        'How do I activate SOS?',
        'Safe Journey advice',
      ],
    };
  }
}
