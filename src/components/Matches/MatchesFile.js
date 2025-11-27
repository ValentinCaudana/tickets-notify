import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { matchesAPI, teamsAPI, tournamentsAPI } from "../../utils/api";
import Navbar from "../Layout/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter } from "lucide-react";

const MatchesList = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    team_id: "",
    tournament_id: "",
    ticket_available: "",
    upcoming: true,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes, tournamentsRes] = await Promise.all([
          matchesAPI.getAll(filters),
          teamsAPI.getAll(),
          tournamentsAPI.getAll(),
        ]);

        const allTeams = teamsRes.data;
        setTeams(allTeams);
        setTournaments(tournamentsRes.data);

        const enrichedMatches = matchesRes.data.map((match) => ({
          ...match,
          home_team: allTeams.find((t) => t.id === match.home_team_id),
          away_team: allTeams.find((t) => t.id === match.away_team_id),
        }));

        setMatches(enrichedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const filteredMatches = matches.filter((match) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      match.home_team?.name.toLowerCase().includes(search) ||
      match.away_team?.name.toLowerCase().includes(search) ||
      match.venue.toLowerCase().includes(search)
    );
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Todos los Partidos
          </h1>
          <p className="text-gray-600">
            Encuentra y sigue tus partidos favoritos
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar equipo o sede..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Team Filter */}
            <Select
              onValueChange={(value) => handleFilterChange("team_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los equipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los equipos</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tournament Filter */}
            <Select
              onValueChange={(value) =>
                handleFilterChange("tournament_id", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los torneos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los torneos</SelectItem>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name} {tournament.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ticket Availability Filter */}
            <Select
              onValueChange={(value) =>
                handleFilterChange("ticket_available", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="true">Entradas disponibles</SelectItem>
                <SelectItem value="false">Sin entradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin text-6xl">⚽</div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron partidos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="block"
                data-testid={`match-card-${match.id}`}
              >
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-6 mb-3">
                        {/* Home Team */}
                        <div className="flex items-center space-x-3 flex-1">
                          {match.home_team?.logo_url && (
                            <img
                              src={match.home_team.logo_url}
                              alt={match.home_team.name}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                          <span className="text-xl font-bold">
                            {match.home_team?.name || "TBD"}
                          </span>
                        </div>

                        <span className="text-2xl font-bold text-gray-400">
                          VS
                        </span>

                        {/* Away Team */}
                        <div className="flex items-center space-x-3 flex-1 justify-end">
                          <span className="text-xl font-bold">
                            {match.away_team?.name || "TBD"}
                          </span>
                          {match.away_team?.logo_url && (
                            <img
                              src={match.away_team.logo_url}
                              alt={match.away_team.name}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center">
                          📅{" "}
                          {format(new Date(match.match_date), "PPPp", {
                            locale: es,
                          })}
                        </span>
                        <span className="flex items-center">
                          🏟️ {match.venue}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-6">
                      {match.ticket_available ? (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                          ✔ Entradas Disponibles
                        </div>
                      ) : match.ticket_sale_date ? (
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                          🕒 Sale:{" "}
                          {format(
                            new Date(match.ticket_sale_date),
                            "dd/MM/yyyy"
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold">
                          Sin información
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesList;
