import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  matchesAPI,
  teamsAPI,
  tournamentsAPI,
  ticketSourcesAPI,
} from "../../utils/api";
import Navbar from "../Layout/Navbar";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  ExternalLink,
  Download,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [ticketSources, setTicketSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchRes = await matchesAPI.getById(id);
        const matchData = matchRes.data;
        setMatch(matchData);

        // Fetch related data
        const [homeTeamRes, awayTeamRes, tournamentRes, sourcesRes] =
          await Promise.all([
            teamsAPI.getById(matchData.home_team_id),
            teamsAPI.getById(matchData.away_team_id),
            tournamentsAPI.getById(matchData.tournament_id),
            ticketSourcesAPI.getAll(),
          ]);

        setHomeTeam(homeTeamRes.data);
        setAwayTeam(awayTeamRes.data);
        setTournament(tournamentRes.data);

        // Filter ticket sources for this match
        const matchSources = sourcesRes.data.filter((source) =>
          matchData.ticket_source_ids.includes(source.id)
        );
        setTicketSources(matchSources);
      } catch (error) {
        console.error("Error fetching match details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [id]);

  const handleDownloadCalendar = async () => {
    try {
      const response = await matchesAPI.exportToCalendar(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `match_${id}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading calendar:", error);
    }
  };

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

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Partido no encontrado</p>
            <Link to="/matches">
              <Button className="mt-4">Volver a partidos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Link to="/matches">
          <Button variant="ghost" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a partidos</span>
          </Button>
        </Link>

        {/* Match Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center mb-6">
            <p className="text-blue-100 mb-2">
              {tournament?.name} {tournament?.year}
            </p>
            <div className="flex items-center justify-center space-x-8">
              {/* Home Team */}
              <div className="flex flex-col items-center">
                {homeTeam?.logo_url && (
                  <img
                    src={homeTeam.logo_url}
                    alt={homeTeam.name}
                    className="w-24 h-24 object-contain mb-3 bg-white rounded-full p-2"
                  />
                )}
                <h2 className="text-2xl font-bold">{homeTeam?.name}</h2>
              </div>

              <div className="text-4xl font-bold">VS</div>

              {/* Away Team */}
              <div className="flex flex-col items-center">
                {awayTeam?.logo_url && (
                  <img
                    src={awayTeam.logo_url}
                    alt={awayTeam.name}
                    className="w-24 h-24 object-contain mb-3 bg-white rounded-full p-2"
                  />
                )}
                <h2 className="text-2xl font-bold">{awayTeam?.name}</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>
                {format(new Date(match.match_date), "PPPp", { locale: es })}
              </span>
            </div>
            <div>🏟️ {match.venue}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={handleDownloadCalendar}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            <span>Agregar a Calendario</span>
          </Button>
        </div>

        {/* Ticket Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Estado de Entradas
          </h3>

          {match.ticket_available ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-green-500 rounded-full p-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-green-900">
                  ¡Entradas Disponibles!
                </h4>
              </div>
              <p className="text-green-800">
                Las entradas para este partido ya están a la venta.
              </p>
            </div>
          ) : match.ticket_sale_date ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h4 className="text-lg font-bold text-yellow-900">
                  Próximamente
                </h4>
              </div>
              <p className="text-yellow-800">
                Las entradas saldrán a la venta el{" "}
                <span className="font-bold">
                  {format(new Date(match.ticket_sale_date), "PPP", {
                    locale: es,
                  })}
                </span>
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <AlertCircle className="w-6 h-6 text-gray-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Sin Información
                </h4>
              </div>
              <p className="text-gray-700">
                Aún no hay información sobre la venta de entradas para este
                partido.
              </p>
            </div>
          )}
        </div>

        {/* Ticket Purchase Information */}
        {ticketSources.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ¿Dónde Comprar?
            </h3>

            <div className="space-y-4">
              {ticketSources.map((source) => (
                <div
                  key={source.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {source.name}
                      </h4>
                      {source.membership_required && (
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                          ⭐ Requiere membresía
                        </span>
                      )}
                    </div>
                    <a
                      href={source.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <span>Ir al sitio</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {source.instructions && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Instrucciones:
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {source.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Team */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {homeTeam?.name}
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">País:</span> {homeTeam?.country}
              </p>
              {homeTeam?.membership_required && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <p className="text-orange-800 font-semibold mb-1">
                    ⭐ Membresía Requerida
                  </p>
                  {homeTeam?.membership_url && (
                    <a
                      href={homeTeam.membership_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 flex items-center space-x-1 text-sm"
                    >
                      <span>Hacerse socio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              {homeTeam?.official_website && (
                <a
                  href={homeTeam.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 mt-3"
                >
                  <span>Sitio oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {awayTeam?.name}
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">País:</span> {awayTeam?.country}
              </p>
              {awayTeam?.membership_required && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <p className="text-orange-800 font-semibold mb-1">
                    ⭐ Membresía Requerida
                  </p>
                  {awayTeam?.membership_url && (
                    <a
                      href={awayTeam.membership_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 flex items-center space-x-1 text-sm"
                    >
                      <span>Hacerse socio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              {awayTeam?.official_website && (
                <a
                  href={awayTeam.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 mt-3"
                >
                  <span>Sitio oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {match.notes && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Notas Adicionales
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{match.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetail;
