const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHVzdWFyaW8iOjEsInVzdWFyaW8iOiJhZG1pbiIsImlkb3JnYW5pemFjYW8iOjMsIm9yZ2FuaXphY2FvIjoiVGVzdGUiLCJpYXQiOjE3NTI1NzY5OTR9.MV3OF3IvttQf5tqNQh83FQxi9iI9B__6Nv2XkOsHXFtA";

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "pgwebia-secret");
  console.log("Token decodificado:", decoded);
} catch (error) {
  console.error("Erro ao decodificar token:", error);
}
