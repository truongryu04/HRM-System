import { usePermissions } from "../hooks/usePermissions";

const TestPage = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePermissions();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>FE to BE connection test</h1>
      <p>
        Endpoint: <code>GET /api/permissions</code>
      </p>

      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Checking..." : "Check connection again"}
        </button>
      </div>

      {isLoading && <p>Loading permissions from BE...</p>}
      {isError && (
        <pre style={{ color: "crimson" }}>
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      )}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  );
};

export default TestPage;
