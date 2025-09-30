import { Timestamp } from "firebase/firestore";

export interface Subscriber {
    email: string;
    startDate: Timestamp | null;
    lastMessage: Timestamp | null;
    emailNumber: number;
}

export const DEFAULT_SUBSCRIBER: Subscriber = {
    email: '',
    startDate: null,
    lastMessage: null,
    emailNumber: 0,
};

export const CONVERSATION_TIPS: any[] = [
    {tip: `Ask "How" and "Why" Questions`, explanation: `These open-ended questions require descriptive answers, moving the conversation beyond simple "yes/no" responses and encouraging deeper thought from the speaker.`},
    {tip: `Practice Active Listening`, explanation: `Nodding, maintaining eye contact, and offering short verbal cues like "I see" or "Ah-ha" validates the speaker, making them feel heard and more likely to share.`},
    {tip: `Summarize and Reflect`, explanation: `Periodically rephrase what the other person just said ("So, if I understand correctly, you're saying..."). This confirms your comprehension and clears up misunderstandings immediately.`},
    {tip: `Use the "Yes, and..." Principle`, explanation: `Borrowed from improv comedy, this technique affirms the speaker's point and then adds new information, keeping the conversation flowing constructively rather than shutting it down.`},
    {tip: `Stay in the Moment (No Mental Planning)`, explanation: `When you stop thinking about your next witty reply, you can genuinely listen to the current thought, which allows you to respond more authentically and relevantly.`},
    {tip: `Embrace Curiosity Over Judgment`, explanation: `Approach the conversation with a genuine desire to learn rather than an intent to critique or argue. This creates a safer, more open environment for dialogue.`},
    {tip: `Share, Don't Dominate`, explanation: `Offer brief, relevant personal anecdotes to connect, but quickly pivot back to the other person. Conversations should be a tennis match, not a solo lecture.`},
    {tip: `Match the Speaker's Energy`, explanation: `Adjust your volume, pace, and tone to align with theirs (without mimicking). This subtle mirroring builds rapport and signals that you are attuned to their emotional state.`},
    {tip: `Name the Emotion`, explanation: `When appropriate, acknowledge the feeling behind their words ("That sounds frustrating," or "You seem excited about that!"). This demonstrates empathy and deepens the connection.`},
    {tip: `Avoid Advice Unless Requested`, explanation: `Unsolicited advice can imply the speaker is incompetent. Showing support and listening first, rather than offering solutions, fosters trust.`},
    {tip: `Use Specific Details`, explanation: `General statements are forgettable. Specific details, like mentioning a person's child's name or a particular project, show you pay attention and value their context.`},
    {tip: `Replace "I know" with "That's interesting"`, explanation: `Saying "I know" can inadvertently cut off a speaker or diminish their experience. Acknowledging their point as "interesting" keeps the door open for them to continue.`},
    {tip: `Focus on Shared Experiences`, explanation: `Finding common ground (a favorite hobby, a mutual acquaintance, a similar challenge) instantly creates a bond and provides fertile ground for discussion.`},
    {tip: `Know When to Stop Talking`, explanation: `Silence is not the enemy. Pausing allows the other person to gather their thoughts, elaborate, or shift the topic organically.`},
    {tip: `Ask Follow-Up Questions`, explanation: `Instead of jumping to a new topic, ask a question based directly on their last point. This signals deep engagement with what they just said.`},
    {tip: `Manage Your Body Language`, explanation: `Keep your posture open (no crossed arms), hands visible, and feet pointed toward the speaker. Non-verbal cues account for a large percentage of communication impact.`},
    {tip: `Leave Your Phone Alone`, explanation: `Checking a phone sends a clear signal that something else is more important than the person in front of you. Giving undivided attention is the ultimate sign of respect.`},
    {tip: `Focus on Concepts, Not Facts`, explanation: `Instead of drilling for specific dates or names, focus the discussion on the underlying themes, lessons learned, or perspectives. This is more engaging than trivia.`},
    {tip: `Give a Genuine Compliment`, explanation: `A sincere, specific compliment about an action or idea ("That was a brilliant way to handle that project") is highly memorable and instantly builds goodwill.`},
    {tip: `Master the Exit Strategy`, explanation: `Have a polite, professional way to end the conversation ("I promised myself I’d catch up on X, but I really enjoyed this chat!") to leave a positive final impression.`},
];
