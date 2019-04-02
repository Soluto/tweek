using System;

namespace Tweek.Engine
{
    public static class TweekValuesResultExtensions
    {
        public static void EnsureSuccess(this TweekValuesResult result)
        {
            if (result.Errors.Count > 0)
            {
                throw new AggregateException(result.Errors.Values);
            }
        }
    }
}