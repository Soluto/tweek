using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Engine.Core.Rules
{
    public interface IRuleParser
    {
        IRule Parse(string sourceCode);
    }
}
