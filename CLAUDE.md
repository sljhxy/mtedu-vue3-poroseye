# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies (using npm mirror)
yarn --registry=https://registry.npmmirror.com

# Start development server (runs on port 80)
npm run dev

# Build for production
npm run build:prod

# Build for staging
yarn build:stage

# Preview production build
yarn preview
```

## Tech Stack

- **Framework**: Vue 3.4.31 with Composition API
- **Build Tool**: Vite 5.3.2
- **UI Library**: Element Plus 2.7.6
- **State Management**: Pinia 2.1.7 (primary), with Vuex 4.0.2 present
- **Router**: Vue Router 4.4.0
- **HTTP Client**: Axios 0.28.1
- **Rich Text Editors**: TinyMCE 7.5.1, Vue Quill 1.2.0
- **Charts**: ECharts 5.5.1
- **Internationalization**: Vue I18n 9.14.5

## Architecture

### Project Structure

```
src/
├── api/              # API service modules organized by domain
│   ├── glxt/         # General education (普教) domain APIs
│   ├── system/       # System management APIs
│   ├── monitor/      # Monitoring APIs
│   └── tool/         # Tool APIs
├── assets/           # Static assets (images, styles, icons)
├── components/       # Reusable components
├── directive/        # Custom Vue directives (permissions, copyText)
├── hooks/            # Custom composition API hooks
├── layout/           # Main layout components
├── locales/          # i18n language files (zh-CN, en-US)
├── plugins/          # Vue plugins (auth, cache, modal, download, tab)
├── router/           # Vue Router configuration
├── store/            # Pinia store modules
├── utils/            # Utility functions
└── views/            # Page components organized by feature
    ├── glxt/         # General education views
    ├── system/       # System management views
    ├── monitor/      # Monitoring views
    └── mj/           # MJ-related views
```

### Key Architectural Patterns

#### Dynamic Route Loading
Routes are fetched from the backend via `getRouters()` API in `src/store/modules/permission.js`. The permission store:
- Requests routes from backend on authentication
- Dynamically loads Vue components using `import.meta.glob('./../../views/**/*.vue')`
- Supports special component types: `Layout`, `ParentView`, `InnerLink`
- Filters routes based on user permissions and roles

#### Authentication Flow
- `src/permission.js` contains the router guard
- On first load with valid token, user info is fetched via `useUserStore().getInfo()`
- Routes are dynamically generated and added to the router
- Token is stored in cookies and sent as `Authorization: Bearer <token>` header
- Custom header `login_type: web_user` is added to all requests

#### API Proxy Configuration
Development API requests are proxied through Vite (see `vite.config.js`):
- `/dev-api` → backend server (currently `http://182.92.215.114:8080`)
- Change `target` in `vite.config.js` to point to different backend servers

#### State Management
Pinia stores in `src/store/modules/`:
- `user.js` - User authentication, profile, permissions
- `permission.js` - Dynamic route generation
- `settings.js` - Application settings (title, theme)
- `tagsView.js` - Tab navigation management
- `dict.js` - Dictionary data caching
- `app.js` - Sidebar and device state

#### Component Registration
Global components registered in `src/main.js`:
- `DictTag` - Dictionary tag display
- `Pagination` - Standard pagination
- `TreeSelect` - Tree selection dropdown
- `FileUpload` / `ImageUpload` - File upload components
- `RightToolbar` - Table toolbar component
- `Editor` - Rich text editor

#### Plugin System
Global plugins in `src/plugins/` provide:
- `$tab` - Tab/page operations
- `$auth` - Permission checking (`hasPermi`, `hasRole`)
- `$cache` - Local/session storage wrapper
- `$modal` - Element Plus modal/alert wrappers
- `$download` - File download utility

### Business Domains

#### GLXT (普教 - General Education)
Located in `src/views/glxt/` and `src/api/glxt/`:
- School management (`base_school`, `vocal_school`)
- Experiment management (`experiment`, `experimentInfo`)
- Question bank (`question`, `questionKnowledge`)
- Subject/course management (`subject`, `base_course`)
- User management (`baseUser`, `vocalUser`)

#### System Management
Located in `src/views/system/` and `src/api/system/`:
- User/role/dept management
- Menu/permission management
- Dictionary management
- Configuration parameters

### Environment Configuration
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Key env vars:
- `VITE_APP_TITLE` - Page title
- `VITE_APP_ENV` - Environment identifier
- `VITE_APP_BASE_API` - API base path for proxy

## Code Conventions

- Use Vue 3 Composition API with `<script setup>`
- API modules export named functions for each endpoint
- Store modules use Pinia with `defineStore`
- Components use Element Plus for UI
- SVG icons are auto-registered from `src/assets/icons/svg/`
- Route meta properties: `title`, `icon`, `noCache`, `hidden`, `activeMenu`
