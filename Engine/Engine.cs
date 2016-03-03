using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Core;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.Core.Utils;
using Engine.Keys;
using Engine.Rules;
using LanguageExt;
using LanguageExt.SomeHelp;
using ContextHelpers = Engine.Context.ContextHelpers;

namespace Engine
{
    internal delegate Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(
        ConfigurationPath path,
        PathTraversal traversal,
        HashSet<Identity> identities,
        GetContextByIdentity getContext,
        RulesRepository rules);


    internal static class _
    {
        internal static Calculate CalculateImpl = async (pathQuery,
            traversal, 
            identities,
            contextRetriever, 
            rules) =>
        {
         
            var paths = traversal(pathQuery);
            var contexts = await ContextHelpers.LoadContexts(identities, contextRetriever);
            var pathsWithRules =  paths.Select(path => new {Path = path, Rules=rules(path)}).ToList();

            return pathsWithRules.Select(x => EngineCore.CalculateKey(identities, contexts, x.Path, x.Rules)
                .Select(value => new { path= x.Path, value }))
            .SkipEmpty()
            .ToDictionary(x => x.path, x => x.value);
        };
    } 
}
