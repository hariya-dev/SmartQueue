namespace QMS.Core.Enums;

public enum PriorityStrategy
{
    Strict = 0,      // All priority tickets first, then normal
    Interleaved = 1  // Interleave: N normal tickets per 1 priority ticket
}
