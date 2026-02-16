FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Admin-Dash/Admin-Dash.csproj Admin-Dash/
RUN dotnet restore Admin-Dash/Admin-Dash.csproj
COPY Admin-Dash/ Admin-Dash/
RUN dotnet build Admin-Dash/Admin-Dash.csproj -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 5103
ENTRYPOINT ["dotnet", "Admin-Dash.dll"]
