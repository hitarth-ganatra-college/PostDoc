const modules = [
  "auth",
  "linkedin",
  "research",
  "generation",
  "image",
  "db",
  "session",
  "pipeline",
];

export default function Home() {
  return (
    <main>
      <h1>PostDoc</h1>
      <p>Greenfield scaffold for the AI LinkedIn Post Generator MVP.</p>
      <h2>Initial Modules</h2>
      <ul>
        {modules.map((moduleName) => (
          <li key={moduleName}>{moduleName}</li>
        ))}
      </ul>
    </main>
  );
}
