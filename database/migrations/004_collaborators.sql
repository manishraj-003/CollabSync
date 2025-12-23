CREATE TABLE IF NOT EXISTS collaborators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id),
    role VARCHAR(20) DEFAULT 'editor', -- editor or viewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
