import * as signalR from '@microsoft/signalr';

const getHubUrl = () => {
  if (typeof window !== 'undefined') {
    // If NEXT_PUBLIC_API_URL is set, use it; otherwise fallback to backend on port 5000
    return process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/orders` 
      : `${window.location.protocol}//${window.location.hostname}:5000/hubs/orders`;
  }
  return 'http://localhost:5000/hubs/orders';
};

export function createOrderHubConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(getHubUrl(), {
      withCredentials: true,
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        if (retryContext.previousRetryCount === 0) return 1000;
        if (retryContext.previousRetryCount < 3) return 3000;
        if (retryContext.previousRetryCount < 10) return 5000;
        return 10000;
      }
    })
    .configureLogging(signalR.LogLevel.None)
    .build();
}
