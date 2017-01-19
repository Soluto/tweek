using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.Context;

namespace Engine.Rules.Schema
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
