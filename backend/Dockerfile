FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY GuessTheNumber.sln .
COPY Api/GuessTheNumber.Api.csproj Api/
COPY Application/GuessTheNumber.Application.csproj Application/
COPY Infrastructure/GuessTheNumber.Infrastructure.csproj Infrastructure/
COPY Domain/GuessTheNumber.Domain.csproj Domain/
RUN dotnet restore GuessTheNumber.sln

COPY . .
RUN dotnet publish Api/GuessTheNumber.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "GuessTheNumber.Api.dll"]
