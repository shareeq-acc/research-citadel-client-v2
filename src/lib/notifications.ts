/** Map server notification type to UI dot variant. */
export type NotificationUiType = 'success' | 'sync' | 'info';

export function notificationUiType(
  type: string,
): NotificationUiType {
  switch (type) {
    case 'AI_COMPLETE':
      return 'success';
    case 'VAULT_ACTIVITY':
      return 'sync';
    case 'INVITATION':
    case 'SECURITY':
    case 'SYSTEM':
    default:
      return 'info';
  }
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
