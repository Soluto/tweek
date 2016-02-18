using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LanguageExt;

namespace Engine.Fixed
{
    public delegate Option<ConfigurationValue> FixedConfigurationRetriever(Identity identity, ConfigurationPath path);
}
