const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Ensures authentication cookies are sent for staff
  });

  if (!response.ok) {
    let errorDetail = 'حدث خطأ أثناء معالجة الطلب.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.title || errorDetail;
    } catch {
      // Fallback text
      if (response.status === 401) errorDetail = 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.';
      if (response.status === 404) errorDetail = 'لم نتمكن من العثور على العنصر المطلوب.';
      if (response.status === 409) errorDetail = 'الكمية المطلوبة غير متوفرة في المخزون.';
    }
    throw new Error(errorDetail);
  }

  // Handle 204 or empty response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
