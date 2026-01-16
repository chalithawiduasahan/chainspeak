export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export class ChainspeakAssistant {
  private qaDatabase: { [key: string]: string } = {
    // Chainspeak-Specific Questions
    'what is chainspeak': 'Chainspeak is a platform where you can store, manage, and sell your digital conversations — like AI chats — privately and securely.',
    'how does chainspeak work': 'You upload or sync your conversations, store them in your private vault, and decide if you want to keep them, analyze them, or sell them anonymously.',
    'is chainspeak free to use': 'Yes, Chainspeak is free for storing and managing your data. Some advanced tools or sales may include small transaction fees.',
    'how do i make money on chainspeak': 'You earn by listing anonymized memory logs for sale in the marketplace. Buyers pay for data they find valuable.',
    'what kind of chats can i upload': 'Any text-based conversation — ChatGPT logs, voice-to-text transcriptions, journal entries, or social DMs. As long as it\'s yours.',
    'can i delete my memory logs': 'Yes. You can delete any log at any time. You have full control over your stored conversations.',
    'is my data public by default': 'No. All logs are private by default. You must manually list them for sale if you want others to access them.',
    'what is the memory vault': 'It\'s your personal, encrypted space where all your conversations are stored securely.',
    'how do i list a memory for sale': 'Go to your vault, select a log, click \'List for Sale\', set a price, and choose whether to anonymize it.',
    'what if someone buys my memory': 'They get a read-only, anonymized copy. Your original memory remains untouched in your vault.',
    'can i track which memories were sold': 'Yes. Your dashboard shows sales history, earnings, and buyer details (if shared).',
    'is chainspeak secure': 'Very. We use blockchain encryption and strict access controls. You control everything.',
    'do i need to know blockchain to use this': 'Not at all. It works in the background. You use Chainspeak just like a regular app.',
    'can i share my vault with others': 'Only if you choose to. By default, it\'s private — but you can manually share specific memories.',
    'will chainspeak sell my data without consent': 'Never. Only you can choose to list data for sale. We don\'t access or sell anything behind your back.',

    // Casual Greetings & Small Talk
    'hi': 'Hey there! How can I help you today?',
    'hello': 'Hello! Need help with Chainspeak or something else?',
    'hey': 'Hey there! How can I help you today?',
    'how are you': 'I\'m running on clean code and good vibes 😄 How about you?',
    'what can you do': 'I can help you understand Chainspeak, your memory vault, data privacy, and how to earn from conversations.',
    'tell me something cool': 'Did you know your chats could be worth real money? On Chainspeak, they totally can.',
    'are you real': 'I\'m real enough to answer your questions and protect your data. That counts, right? 😅',
    'what\'s your name': 'I\'m Chainspeak Assistant — your guide through memory vaults, privacy, and digital data.',
    'whats your name': 'I\'m Chainspeak Assistant — your guide through memory vaults, privacy, and digital data.',
    'can you help me earn money': 'Absolutely. I\'ll show you how to store and sell your chat data safely. Ask away!',

    // General Tech, Business, and AI Questions
    'what is ai': 'AI stands for Artificial Intelligence — machines that can learn, reason, and help us automate tasks or make decisions.',
    'what is blockchain': 'Blockchain is a secure digital ledger that stores data in blocks — great for privacy, security, and transparency.',
    'how is blockchain used in chainspeak': 'It keeps your memory logs encrypted, traceable, and tamper-proof. No one can change your data once stored.',
    'can ai help businesses': 'Definitely. AI boosts productivity, customer service, marketing, and decision-making.',
    'how can i start a business': 'Start by solving a real problem, build something useful, and offer it to a target audience. Simpler than it sounds — but powerful.',
    'what is data privacy': 'Data privacy means protecting your personal information from being shared, sold, or misused without your consent.',
    'why is digital privacy important': 'Because your conversations, thoughts, and patterns can be valuable — and vulnerable if exposed.',
    'what is big data': 'Big data is the collection of massive datasets — like user behavior — often used for insights or prediction.',
    'can i sell my data legally': 'Yes — as long as you own it, and you share it anonymously. Chainspeak helps you do this the right way.',
    'what\'s the future of ai': 'AI is moving toward personal assistants, smarter automation, and emotional intelligence. It\'s growing fast — just like you.',
    'whats the future of ai': 'AI is moving toward personal assistants, smarter automation, and emotional intelligence. It\'s growing fast — just like you.'
  }

  private normalizeQuestion(question: string): string {
    return question.toLowerCase()
      .trim()
      .replace(/[?!.]/g, '')
      .replace(/\s+/g, ' ')
  }

  private findBestMatch(userInput: string): string | null {
    const normalized = this.normalizeQuestion(userInput)
    
    // Direct match
    if (this.qaDatabase[normalized]) {
      return this.qaDatabase[normalized]
    }

    // Partial match - check if user input contains key phrases
    for (const [question, answer] of Object.entries(this.qaDatabase)) {
      if (normalized.includes(question) || question.includes(normalized)) {
        return answer
      }
    }

    // Check for common variations
    const variations: { [key: string]: string } = {
      'how are you doing': 'how are you',
      'what do you do': 'what can you do',
      'who are you': 'what\'s your name',
      'what are you': 'what\'s your name',
      'help me make money': 'can you help me earn money',
      'how to make money': 'how do i make money on chainspeak',
      'how to earn': 'how do i make money on chainspeak',
      'what is artificial intelligence': 'what is ai',
      'tell me about ai': 'what is ai',
      'explain blockchain': 'what is blockchain',
      'what is crypto': 'what is blockchain',
      'how to start business': 'how can i start a business',
      'starting a business': 'how can i start a business',
      'privacy': 'what is data privacy',
      'data protection': 'what is data privacy',
      'is it safe': 'is chainspeak secure',
      'security': 'is chainspeak secure',
      'how safe': 'is chainspeak secure'
    }

    for (const [variation, mappedQuestion] of Object.entries(variations)) {
      if (normalized.includes(variation)) {
        return this.qaDatabase[mappedQuestion]
      }
    }

    return null
  }

  async sendMessage(userMessage: string): Promise<Message> {
    // Simulate a small delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    const response = this.findBestMatch(userMessage)
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: response || "Hmm, I'm not sure about that yet! I'm still learning. Try asking me something about Chainspeak, privacy, or how to earn from your chat data.",
      sender: 'ai',
      timestamp: new Date()
    }

    return aiMessage
  }
}

export const chainspeakAssistant = new ChainspeakAssistant()