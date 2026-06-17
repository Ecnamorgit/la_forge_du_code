import React from "react";

interface CourseWireframeProps {
  slug: string;
  className?: string;
}

export default function CourseWireframe({ slug, className = "" }: CourseWireframeProps) {
  const props = { className: `w-44 h-44 ${className}` };

  switch (slug) {
    case "html":
      return <HtmlWireframe {...props} />;
    case "css":
      return <CssWireframe {...props} />;
    case "javascript":
      return <JavaScriptWireframe {...props} />;
    case "react":
      return <ReactWireframe {...props} />;
    case "typescript":
      return <TypeScriptWireframe {...props} />;
    case "git":
      return <GitWireframe {...props} />;
    case "sql":
      return <SqlWireframe {...props} />;
    case "nodejs":
      return <NodejsWireframe {...props} />;
    case "tests":
      return <TestsWireframe {...props} />;
    case "devops":
      return <DevOpsWireframe {...props} />;
    case "mongodb":
      return <MongodbWireframe {...props} />;
    case "security":
      return <SecurityWireframe {...props} />;
    case "python":
      return <PythonWireframe {...props} />;
    case "algo":
      return <AlgoWireframe {...props} />;
    default:
      return null;
  }
}

// 1. HTML5 Shield Wireframe
function HtmlWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Outer Shield Shield */}
      <path d="M15,10 L85,10 L78,75 L50,90 L22,75 Z" />
      {/* Concentric Inner Shield */}
      <path d="M22,17 L78,17 L72,70 L50,83 L28,70 Z" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Central Axis Wireframe Line */}
      <path d="M50,10 L50,90" strokeWidth="0.5" />
      {/* Horizontal grid mesh lines */}
      <path d="M20,30 L80,30" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M20,50 L80,50" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M20,70 L80,70" strokeWidth="0.5" strokeDasharray="3 3" />
      {/* Outline of HTML '5' */}
      <path d="M30,28 L70,28 L68,42 L34,42 L36,56 L64,56 L61,72 L50,77 L39,72 L38,62" strokeWidth="1.2" />
    </svg>
  );
}

// 2. CSS3 Shield Wireframe
function CssWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Outer Shield Shield */}
      <path d="M15,10 L85,10 L78,75 L50,90 L22,75 Z" />
      {/* Isometric mesh lines inside shield */}
      <path d="M15,10 L50,90 M85,10 L50,90" strokeWidth="0.5" strokeOpacity="0.4" />
      <path d="M20,20 L80,20 M20,40 L80,40 M20,60 L80,60" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M20,80 L80,80" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Outline of CSS '3' */}
      <path d="M30,28 L70,28 L68,42 L46,42 L47,52 L66,52 L63,70 L50,75 L37,70" strokeWidth="1.2" />
    </svg>
  );
}

// 3. JavaScript Square Wireframe
function JavaScriptWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Main Square */}
      <rect x="15" y="15" width="70" height="70" rx="6" />
      {/* Inner blueprint coordinate grid */}
      <path d="M15,32.5 L85,32.5 M15,50 L85,50 M15,67.5 L85,67.5" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M32.5,15 L32.5,85 M50,15 L50,85 M67.5,15 L67.5,85" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Diagonal grid lines */}
      <path d="M15,15 L85,85 M15,85 L85,15" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* JS Letters outline */}
      <path d="M36,54 L42,54 L42,68 C42,73 37,75 32,73 M50,71 C52,73 57,75 62,75 C68,75 70,71 70,67 C70,61 64,59 58,57 C52,55 50,53 50,49 C50,45 54,43 60,43 C65,43 68,45 70,47" strokeWidth="1.2" />
    </svg>
  );
}

// 4. React Atom Loops Wireframe
function ReactWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Orbital paths */}
      <ellipse cx="50" cy="50" rx="42" ry="14" transform="rotate(0 50 50)" />
      <ellipse cx="50" cy="50" rx="42" ry="14" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="42" ry="14" transform="rotate(120 50 50)" />
      {/* Center nucleus */}
      <circle cx="50" cy="50" r="6" />
      {/* Concentric radar lines */}
      <circle cx="50" cy="50" r="18" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="30" strokeWidth="0.5" strokeDasharray="3 3" />
    </svg>
  );
}

// 5. TypeScript Shield Wireframe
function TypeScriptWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Main Square Container */}
      <rect x="15" y="15" width="70" height="70" rx="6" />
      {/* Blueprint background grid */}
      <rect x="23" y="23" width="54" height="54" rx="4" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M15,50 L85,50 M50,15 L50,85" strokeWidth="0.5" strokeOpacity="0.4" />
      {/* TS Letters outline */}
      <path d="M26,34 L44,34 M35,34 L35,66 M50,66 L50,52 C50,48 54,46 60,46 C65,46 70,48 70,54 M50,58 L70,58" strokeWidth="1.2" />
    </svg>
  );
}

// 6. Git Branch Nodes Wireframe
function GitWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Main branches paths */}
      <path d="M32,70 L32,30 C32,30 32,50 64,50 L64,70" strokeWidth="1.5" />
      {/* Nodes (Circles) */}
      <circle cx="32" cy="30" r="6" />
      <circle cx="32" cy="70" r="6" />
      <circle cx="64" cy="70" r="6" />
      {/* Concentric node signal rings */}
      <circle cx="32" cy="30" r="14" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="32" cy="70" r="14" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="64" cy="70" r="14" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Grid backdrop */}
      <path d="M10,50 L90,50 M32,10 L32,90 M64,10 L64,90" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
    </svg>
  );
}

// 7. SQL Database Cylinder Wireframe
function SqlWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Top cylinder block */}
      <ellipse cx="50" cy="28" rx="28" ry="8" />
      <path d="M22,28 L22,44 A28,8 0 0,0 78,44 L78,28" />
      <ellipse cx="50" cy="44" rx="28" ry="8" strokeWidth="0.5" strokeDasharray="2 2" />
      
      {/* Middle cylinder block */}
      <path d="M22,44 L22,60 A28,8 0 0,0 78,60 L78,44" />
      <ellipse cx="50" cy="60" rx="28" ry="8" strokeWidth="0.5" strokeDasharray="2 2" />

      {/* Bottom cylinder block */}
      <path d="M22,60 L22,76 A28,8 0 0,0 78,76 L78,60" />
      <ellipse cx="50" cy="76" rx="28" ry="8" strokeWidth="0.5" strokeDasharray="2 2" />

      {/* Vertical wireframe lines */}
      <path d="M50,20 L50,76 M36,25 L36,72 M64,25 L64,72" strokeWidth="0.5" strokeDasharray="1 3" />
    </svg>
  );
}

// 8. Node.js Hexagonal Wireframe
function NodejsWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Outer Hexagon */}
      <polygon points="50,12 84,31 84,69 50,88 16,69 16,31" />
      {/* Inner Hexagon projection (Isometric 3D Cube) */}
      <path d="M50,12 L50,88 M50,50 L84,31 M50,50 L16,31 M50,50 L84,69 M50,50 L16,69" strokeWidth="0.5" />
      {/* Concentric inner hexagon grid */}
      <polygon points="50,27 75,41 75,59 50,73 25,59 25,41" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="8" strokeWidth="0.5" />
    </svg>
  );
}

// 9. Tests Beaker/Flask Wireframe
function TestsWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Flask outline */}
      <path d="M42,15 L58,15 M46,15 L46,35 L22,75 C19,79 21,85 27,85 L73,85 C79,85 81,79 78,75 L54,35 L54,15" />
      {/* Fluid level lines */}
      <path d="M31,60 L69,60" strokeWidth="0.5" />
      <path d="M26,69 L74,69" strokeWidth="0.5" />
      <path d="M23,77 L77,77" strokeWidth="0.5" />
      {/* Graduated marking lines */}
      <path d="M54,44 L59,44 M54,53 L61,53 M54,62 L63,62 M54,71 L65,71" strokeWidth="0.5" />
      {/* Wireframe bubble markers */}
      <circle cx="41" cy="71" r="3.5" />
      <circle cx="59" cy="63" r="4.5" />
      <circle cx="48" cy="49" r="2" />
      <circle cx="53" cy="76" r="1.5" />
    </svg>
  );
}

// 10. DevOps / Docker / Infinity Loop Wireframe
function DevOpsWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Infinity loop (CI/CD) */}
      <path d="M30,50 C10,32 10,68 30,50 C50,32 50,68 70,50 C90,32 90,68 70,50 C60,41 40,59 30,50 Z" strokeWidth="1.5" />
      {/* Inner offset loop */}
      <path d="M30,50 C13,36 13,64 30,50 C47,36 53,64 70,50 C87,36 87,64 70,50 Z" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Radial grid lines */}
      <line x1="50" y1="12" x2="50" y2="88" strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1="12" y1="50" x2="88" y2="50" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="16" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

// 11. MongoDB Leaf Wireframe
function MongodbWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Leaf outline */}
      <path d="M50,10 C50,10 18,36 18,62 C18,79 32,90 50,90 C68,90 82,79 82,62 C82,36 50,10 50,10 Z" />
      {/* Center line leaf stem */}
      <path d="M50,10 L50,90" strokeWidth="0.5" />
      {/* Leaf ribs / grid lines */}
      <path d="M50,32 C36,42 32,56 32,66 M50,32 C64,42 68,56 68,66" strokeWidth="0.5" />
      <path d="M50,46 C33,56 25,70 25,80 M50,46 C67,56 75,70 75,80" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M50,60 C39,70 35,83 35,87 M50,60 C61,70 65,83 65,87" strokeWidth="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

// 12. Security Shield / Lock Wireframe
function SecurityWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Outer Shield */}
      <path d="M18,15 L50,5 L82,15 L82,50 C82,72 68,86 50,95 C32,86 18,72 18,50 Z" />
      {/* Inner Concentric Shield */}
      <path d="M26,21 L50,13 L74,21 L74,50 C74,68 62,80 50,88 C38,80 26,68 26,50 Z" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Padlock structure */}
      <rect x="41" y="44" width="18" height="14" rx="2" />
      <path d="M45,44 L45,37 C45,31 55,31 55,37 L55,44" />
      {/* Lock keyhole */}
      <circle cx="50" cy="51" r="2.5" />
      <path d="M50,53.5 L50,57" strokeWidth="1.2" />
    </svg>
  );
}

// 13. Python Snakes Wireframe
function PythonWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Top Snake */}
      <path d="M50,10 C35,10 32,18 32,28 L32,38 L50,38 L50,44 L25,44 C15,44 10,48 10,62 C10,75 16,80 28,80 L36,80 L36,72 C36,62 42,56 52,56 L70,56 L70,46 C70,30 65,10 50,10 Z" />
      {/* Bottom Snake */}
      <path d="M50,90 C65,90 68,82 68,72 L68,62 L50,62 L50,56 L75,56 C85,56 90,52 90,38 C90,25 84,20 72,20 L64,20 L64,28 C64,38 58,44 48,44 L30,44 L30,54 C30,70 35,90 50,90 Z" />
      {/* Eyes */}
      <circle cx="39" cy="22" r="2" />
      <circle cx="61" cy="78" r="2" />
      
      {/* Concentric contour lines representing 3D wireframe mesh */}
      <path d="M32,28 C32,20 40,16 50,16 C60,16 68,22 68,30" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M32,72 C32,80 40,84 50,84 C60,84 68,78 68,70" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d="M20,50 L80,50" strokeWidth="0.5" strokeDasharray="4 4" />
    </svg>
  );
}

// 14. Algorithmie / Network Tree Graph Wireframe
function AlgoWireframe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Network Nodes (Circles) */}
      <circle cx="50" cy="20" r="5.5" />
      <circle cx="25" cy="46" r="5.5" />
      <circle cx="75" cy="46" r="5.5" />
      <circle cx="12" cy="75" r="5.5" />
      <circle cx="38" cy="75" r="5.5" />
      <circle cx="62" cy="75" r="5.5" />
      <circle cx="88" cy="75" r="5.5" />
      
      {/* Node connections (Lines) */}
      <line x1="50" y1="25.5" x2="25" y2="40.5" />
      <line x1="50" y1="25.5" x2="75" y2="40.5" />
      <line x1="25" y1="51.5" x2="12" y2="69.5" />
      <line x1="25" y1="51.5" x2="38" y2="69.5" />
      <line x1="75" y1="51.5" x2="62" y2="69.5" />
      <line x1="75" y1="51.5" x2="88" y2="69.5" />
      
      {/* Grid mesh backdrop */}
      <path d="M50,5 L50,95 M5,50 L95,50" strokeWidth="0.5" strokeDasharray="1 4" strokeOpacity="0.4" />
      <circle cx="50" cy="50" r="32" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="44" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.3" />
    </svg>
  );
}
