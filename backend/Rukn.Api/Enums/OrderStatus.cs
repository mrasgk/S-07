namespace Rukn.Api.Enums;

public enum OrderStatus
{
    New = 0,        // جديد
    Preparing = 1,  // قيد التحضير
    Ready = 2,      // جاهز
    Completed = 3,  // تم التسليم
    Cancelled = 4   // ملغي
}
