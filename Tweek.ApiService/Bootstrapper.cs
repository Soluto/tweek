using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Cassandra;
using Engine;
using Engine.Context;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Drivers.Rules.Git;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;

namespace Tweek.ApiService
{

    public class Bootstrapper : DefaultNancyBootstrapper
    {

        public Tuple<IContextDriver, IRulesDriver> GetDrivers()
        {
            var driver = GetCassandraDriver();
            return new Tuple<IContextDriver, IRulesDriver>(driver, new GitDriver(
                Path.Combine(System.Web.HttpRuntime.AppDomainAppPath, "tweek-rules" + Guid.NewGuid()),
                new RemoteRepoSettings()
                {
                    url = "http://tweek-gogs-1.816587ba.cont.dockerapp.io/tweek/tweek-rules.git",
                    Email = "tweek@soluto.com",
                    UserName = "tweek",
                    Password = "po09!@QW"
                }));
        } 

        private CassandraDriver GetCassandraDriver()
        {
            var cluster = Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.All))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            var session = cluster.Connect("tweek");
            return new CassandraDriver(session);
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            var drivers = GetDrivers();
            ITweek tweek = Task.Run(async()=> await Engine.Tweek.Create(drivers.Item1,
                                           drivers.Item2)).Result;

            container.Register<ITweek>((ctx, no) => tweek);
            base.ApplicationStartup(container, pipelines);
        }
    }
}