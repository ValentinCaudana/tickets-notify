import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleSessionId } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get session_id from URL fragment
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          setError("No session ID found");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        // Process session ID
        const success = await handleSessionId(sessionId);

        if (success) {
          // Clean URL and redirect to dashboard
          window.history.replaceState({}, document.title, "/dashboard");
          navigate("/dashboard");
        } else {
          setError("Authentication failed");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Authentication error");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    processAuth();
  }, [navigate, handleSessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center space-y-4">
        {error ? (
          <>
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-red-600">{error}</h2>
            <p className="text-gray-600">Redirigiendo...</p>
          </>
        ) : (
          <>
            <div className="animate-spin text-6xl">⚽</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Autenticando...
            </h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
