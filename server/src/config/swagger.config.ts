import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("NN SECA TMS API")
  .setDescription("Task Management System API for managing boards, tickets, and users.")
  .setVersion("1.0.0")
  .setContact(
    "NN SECA TMS Support",
    "https://github.com/your-repo/nn-seca-tms",
    "support@nn-seca-tms.com",
  )
  .setLicense("MIT", "https://opensource.org/licenses/MIT")
  .addServer("http://localhost:3000", "Local Development Server")
  .addServer("http://localhost:3000/api/v1", "API v1 (if versioned)")
  .addBearerAuth(
    {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "Authorization",
      description: 'Enter your JWT token (without "Bearer " prefix)',
      in: "header",
    },
    "JWT-auth",
  )
  .addTag("Authentication", "User authentication and token management")
  .addTag("Users", "User management and profile operations")
  .addTag("Boards", "Board creation and management")
  .addTag("Tickets", "Ticket operations and movement")
  .build();

export const swaggerOptions = {
  customSiteTitle: "NN SECA TMS API Documentation",
  customfavIcon: "/favicon.ico",
  customCss: `
    .swagger-ui .topbar { background-color: #1f2937; border-bottom: 2px solid #3b82f6; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #1f2937; }
    .swagger-ui .scheme-container { background-color: #f8fafc; border: 1px solid #e2e8f0; }
    .swagger-ui .btn.authorize { background-color: #3b82f6; border-color: #3b82f6; }
    .swagger-ui .btn.authorize:hover { background-color: #2563eb; border-color: #2563eb; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: "none",
    defaultModelExpandDepth: 3,
    defaultModelsExpandDepth: 2,
    displayOperationId: false,
    tryItOutEnabled: true,
    requestInterceptor: (req: Request) => {
      return req;
    },
    responseInterceptor: (res: Response) => {
      return res;
    },
  },
};
