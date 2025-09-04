-- Conversations
CREATE TABLE Conversations (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE Messages (
  id SERIAL PRIMARY KEY,
  conversationId INT NOT NULL REFERENCES Conversations(id) ON DELETE CASCADE,
  senderId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Catalogs
CREATE TABLE Catalogs (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    catalogName VARCHAR(100) NOT NULL,
);

-- Conversation participants
CREATE TABLE ConversationParticipants (
  conversationId INT NOT NULL REFERENCES Conversations(id) ON DELETE CASCADE,
  userId INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  blackList BOOLEAN DEFAULT FALSE,
  favoriteList BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (conversationId, userId)
);

-- CatalogChats table 
CREATE TABLE CatalogChats (
  catalogId INT NOT NULL REFERENCES Catalogs(id) ON DELETE CASCADE,
  conversationId INT NOT NULL REFERENCES Conversations(id) ON DELETE CASCADE,
  PRIMARY KEY (catalogId, conversationId)
);