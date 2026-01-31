-- WhatsApp Bot Session Management Table
-- This table tracks conversation state for each user

CREATE TABLE IF NOT EXISTS bot_session (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    current_phase VARCHAR(50),
    temp_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Index for fast phone number lookups
CREATE INDEX IF NOT EXISTS idx_bot_session_phone ON bot_session(phone_number);

-- Add comment for documentation
COMMENT ON TABLE bot_session IS 'Stores WhatsApp bot conversation state for each user';
COMMENT ON COLUMN bot_session.phone_number IS 'User phone number from Twilio (format: whatsapp:+1234567890)';
COMMENT ON COLUMN bot_session.current_phase IS 'Current conversation phase (e.g., WAIT_CONSENT, WAIT_MEDICINE)';
COMMENT ON COLUMN bot_session.temp_data IS 'JSON object storing user responses during conversation';
