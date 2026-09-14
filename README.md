# Medical Study Atlas

A TypeScript + Next.js web application for managing medical research studies and documentation.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, CSS
- **Backend:** Supabase
- **UI Components:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hakery56-lgtm/-medical-study-atlas.git
cd -medical-study-atlas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

## Project Structure

```
├── app/                    # Next.js app directory
├── lib/                    # Utility functions and helpers
├── public/                 # Static assets
├── components/             # React components
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Project dependencies
```

## Features

- Medical study documentation and management
- Research study tracking
- Data organization and retrieval
- Responsive design with Tailwind CSS

## Deployment

The application is deployed on [Vercel](https://medical-study-atlas.vercel.app).

To deploy your own version:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with a single click

## Development

- Follow TypeScript strict mode best practices
- Use Tailwind CSS for styling
- Component-based architecture
- Keep functions in `/lib` directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please create an issue in the repository.