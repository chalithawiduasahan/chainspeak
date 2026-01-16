// Mock IPFS Storage implementation
// Since web3.storage API has been sunset, we use a mock implementation for development

export class IPFSStorage {
  private initialized = true // Always initialized in mock mode

  constructor() {
    console.log('IPFS Storage initialized in mock mode (web3.storage API has been sunset)')
  }

  async uploadEncryptedData(encryptedData: string): Promise<string> {
    // Mock implementation for development
    console.log('Mock IPFS upload:', encryptedData.substring(0, 50) + '...')
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    // Generate a realistic-looking mock CID
    const mockCid = `bafybeig${Math.random().toString(36).substr(2, 50)}`
    console.log('Mock IPFS upload completed with CID:', mockCid)
    
    return mockCid
  }

  async retrieveEncryptedData(cid: string): Promise<string> {
    // Mock implementation for development
    console.log('Mock IPFS retrieve:', cid)
    
    // Simulate retrieval delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
    
    // Return mock encrypted data structure
    const mockData = JSON.stringify({
      username: 'mock-user',
      userMessage: 'This is a mock user message retrieved from IPFS',
      aiReply: 'This is a mock AI reply retrieved from IPFS. The actual data would be encrypted.',
      timestamp: new Date().toISOString()
    })
    
    console.log('Mock IPFS retrieve completed')
    return mockData
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

export const ipfsStorage = new IPFSStorage()