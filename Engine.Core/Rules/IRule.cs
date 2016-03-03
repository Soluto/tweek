using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.Context;
using LanguageExt;

namespace Engine.Core.Rules
{
    public interface IRule
    {
        Option<ConfigurationValue> GetValue(GetContextValue fullContext);
    }
}
