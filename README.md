InteractHub - Social Media Platform
A full-stack social media web application built with React + TypeScript (Frontend) and ASP.NET Core (Backend).

🌐 Live Demo
Frontend: https://interact-hub-client.vercel.app
Backend API: https://interacthub-api.azurewebsites.net/swagger
🛠️ Technology Stack
Frontend
+ React 18 + TypeScript
+ Tailwind CSS v4
+ React Router v6
+ React Hook Form
+ Axios
+ Vite

Backend
+ ASP.NET Core 8.0
+ Entity Framework Core 8.0
+ SQL Server (Azure)
+ JWT Authentication
+ ASP.NET Core Identity
+ Azure Blob Storage
+ Swagger/OpenAPI
+ DevOps
+ Microsoft Azure (App Service, SQL, Blob Storage)
+ GitHub Actions CI/CD
+ Vercel (Frontend)

✨ Features
✅ User registration and authentication with JWT
✅ Create, edit, delete posts with image upload
✅ Like and comment on posts
✅ Share posts
✅ Stories (24-hour temporary content)
✅ Friend requests (send, accept, decline, unfriend)
✅ Real-time notifications
✅ User profile with avatar
✅ Search users
✅ Trending hashtags
✅ Report inappropriate content
✅ Responsive design (mobile-friendly)
✅ Protected routes with auth guards
🚀 Getting Started
Prerequisites
+ Node.js 18+
+ .NET 8.0 SDK
+ SQL Server
+ Visual Studio 2022 or VS Code

Backend Setup
1. Clone the repository:
    git clone https://github.com/Bllue1314/CSharp
    cd CSharp
2. Navigate to the API project:
    cd InteractHub.API
3. Update appsettings.json with your connection strings:
    {
    "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=InteractHubDb;Trusted_Connection=True;TrustServerCertificate=True;"
    },
    "JwtSettings": {
        "SecretKey": "YourSecretKeyHere",
        "Issuer": "InteractHub.API",
        "Audience": "InteractHub.Client",
        "ExpirationInDays": 7
    },
    "BlobStorage": {
        "ConnectionString": "your-azure-blob-connection-string",
        "ContainerName": "interacthub-media"
    }
    }
4. Run migrations:
    dotnet ef database update
5. Run the API:
    dotnet run
6. Open Swagger at: https://localhost:{port}/swagger

Frontend Setup
1. Navigate to the client project:
    cd InteractHub.Client
2. Install dependencies:
    npm install
3. Update API base URL in src/services/api.ts if running locally:
    const api = axios.create({
    baseURL: 'https://localhost:{port}/api',
    });
4. Run the development server:
    npm run dev
5. Open: http://localhost:5173


📁 Project Structure
CSharp/
├── InteractHub.API/          # ASP.NET Core Backend
│   ├── Controllers/          # API Controllers
│   ├── Data/                 # DbContext
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Models/               # Entity Models
│   ├── Services/             # Business Logic
│   ├── Repositories/         # Data Access
│   ├── Helpers/              # Utilities
│   └── Migrations/           # EF Migrations
│
├── InteractHub.Tests/        # Unit Tests (xUnit)
│   ├── Auth/                 # Token Service Tests
│   ├── Services/             # Service Tests
│   └── Helpers/              # Test Utilities
│
└── InteractHub.Client/       # React Frontend
    └── src/
        ├── components/       # Reusable Components
        ├── pages/            # Page Components
        ├── context/          # React Context
        ├── hooks/            # Custom Hooks
        ├── services/         # API Services
        ├── layouts/          # Layout Components
        └── utils/            # Utilities
🗄️ Database Schema
Entities:
+ User (extends IdentityUser) — user accounts
+ Post — status updates with text/images
+ Comment — comments on posts
+ Like — post likes
+ Friendship — friend relationships
+ Story — 24-hour temporary content
+ Notification — user notifications
+ Hashtag — trending topics
+ PostHashtag — many-to-many join
+ PostReport — content moderation

Relationships:
+ User → Posts (One-to-Many)
+ Post → Comments (One-to-Many)
+ Post → Likes (One-to-Many)
+ User → Friendships (Self-referencing)
+ Post ↔ Hashtags (Many-to-Many via PostHashtag)

🔐 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/auth/register	Register new account
POST	/api/auth/login	Login and get JWT
GET	/api/auth/me	Get current user

Posts
Method	Endpoint	Description
GET	/api/posts	Get feed
POST	/api/posts	Create post
PUT	/api/posts/{id}	Update post
DELETE	/api/posts/{id}	Delete post
POST	/api/posts/{id}/like	Toggle like
GET	/api/posts/{id}/comments	Get comments
POST	/api/posts/{id}/comments	Add comment
DELETE	/api/posts/{id}/comments/{commentId}	Delete comment
POST	/api/posts/{id}/report	Report post
GET	/api/posts/trending	Trending hashtags

Users
Method	Endpoint	Description
GET	/api/users/{id}	Get user profile
GET	/api/users/me	Get current user profile
PUT	/api/users/me	Update profile
DELETE	/api/users/me	Delete account
GET	/api/users/search	Search users
Friends

Method	Endpoint	Description
GET	/api/friends	Get friends list
GET	/api/friends/requests	Get pending requests
POST	/api/friends/{userId}	Send friend request
PUT	/api/friends/{id}/accept	Accept request
DELETE	/api/friends/{id}	Remove/decline friend
Stories

Method	Endpoint	Description
GET	/api/stories	Get active stories
POST	/api/stories	Create story
DELETE	/api/stories/{id}	Delete story
Notifications
Method	Endpoint	Description
GET	/api/notifications	Get notifications
PUT	/api/notifications/{id}/read	Mark as read
PUT	/api/notifications/read-all	Mark all as read

🧪 Testing
Run unit tests:

    cd InteractHub.Tests
    dotnet test --verbosity normal
Run with coverage:

    dotnet test --collect:"XPlat Code Coverage"
    reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage-report" -reporttypes:Html

Test Coverage:
+ PostsService — 7 tests (CRUD, likes, comments)
+ FriendsService — 5 tests (requests, acceptance, removal)
+ NotificationsService — 4 tests (create, read, mark all)
+ TokenService — 3 tests (generation, claims, expiry)
Total: 19 tests
🚢 Deployment
Azure Resources
Resource	Name
Resource Group	InteractHub-RG
App Service	interacthub-api
SQL Server	interacthub-sqlserver
SQL Database	InteractHubDb
Storage Account	interacthubstore2026

CI/CD Pipeline
GitHub Actions automatically:
1. Restores NuGet packages
2. Builds the solution
3. Runs all 19 unit tests
4. Publishes the app
5. Deploys to Azure App Service
Pipeline config: .github/workflows/deploy.yml

📝 Academic Integrity
This project was developed individually as part of the C# and .NET Development course at Saigon University, Spring 2026.
