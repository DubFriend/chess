CREATE TABLE IF NOT EXISTS Chess_Game (
    id CHAR(5) PRIMARY KEY,
    board VARCHAR(1000),
    side CHAR(1),
    time_stamp DATETIME
);
