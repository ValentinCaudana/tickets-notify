import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { matchesAPI, teamsAPI, preferencesAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../Layout/Navbar";
import { Button } from "../ui/button";
import { Calendar, ExternalLink, Ticket } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [followedTeams, setFollowedTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user preferences
        const prefsRes = await preferencesAPI.get();
        const teamIds = prefsRes.data.followed_team_ids || [];

        // Get all teams
        const teamsRes = await teamsAPI.getAll();
        const allTeams = teamsRes.data;

        // Filter followed teams
        const followed = allTeams.filter((team) => teamIds.includes(team.id));
        setFollowedTeams(followed);

        // Get upcoming matches
        const matchesRes = await matchesAPI.getAll({ upcoming: true });
        let matches = matchesRes.data;

        // Filter by followed teams if any
        if (teamIds.length > 0) {
          matches = matches.filter(
            (match) =>
              teamIds.includes(match.home_team_id) ||
              teamIds.includes(match.away_team_id)
          );
        }

        // Enrich matches with team data
        const enrichedMatches = matches.slice(0, 6).map((match) => ({
          ...match,
          home_team: allTeams.find((t) => t.id === match.home_team_id),
          away_team: allTeams.find((t) => t.id === match.away_team_id),
        }));

        setUpcomingMatches(enrichedMatches);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin text-6xl">⚽</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">¡Hola, {user?.name}! ⚽</h1>
          <p className="text-blue-100">
            Bienvenido a tu panel de notificaciones de entradas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Ticket className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Próximos Partidos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {upcomingMatches.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-3xl">⭐</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Equipos Seguidos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {followedTeams.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Entradas Disponibles</p>
                <p className="text-3xl font-bold text-gray-900">
                  {upcomingMatches.filter((m) => m.ticket_available).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Próximos Partidos
            </h2>
            <Link to="/matches">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Ver todos</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay partidos próximos</p>
              <Link to="/preferences">
                <Button>Seguir equipos</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block"
                >
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-lg font-bold">
                            {match.home_team?.name || "Equipo Local"}
                          </span>
                          <span className="text-gray-500">vs</span>
                          <span className="text-lg font-bold">
                            {match.away_team?.name || "Equipo Visitante"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            📅{" "}
                            {format(new Date(match.match_date), "PPP", {
                              locale: es,
                            })}
                          </span>
                          <span>🏟️ {match.venue}</span>
                        </div>
                      </div>
                      <div>
                        {match.ticket_available ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ✔ Entradas Disponibles
                          </span>
                        ) : match.ticket_sale_date ? (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            🕒 Sale:{" "}
                            {format(new Date(match.ticket_sale_date), "dd/MM")}
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Sin info
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Followed Teams */}
        {followedTeams.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mis Equipos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {followedTeams.map((team) => (
                <div
                  key={team.id}
                  className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 transition-all"
                >
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="w-16 h-16 mx-auto mb-2 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                      ⚽
                    </div>
                  )}
                  <p className="font-semibold text-gray-900">{team.name}</p>
                  <p className="text-sm text-gray-500">{team.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
