using Engine.Core.Context;

namespace Tweek.Engine.Rules.Schema
{
    public delegate GetContextValue ValidateContext(GetContextValue origin);
    public class ContextValidation
    {
        public static ValidateContext CreateValidator(bool attemptToPatchChanges)
        {
            return x => x;
        }
    }
}
