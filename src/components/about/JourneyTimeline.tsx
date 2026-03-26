const timeline = [
  {
    year: "2009",
    title: "Service Crew at Jollibee Corporation",
    description:
      "Started working early as a Service Crew at Jollibee Corporation, gaining frontline customer service experience and workplace discipline.",
    side: "right",
  },
  {
    year: "2010",
    title: "Early Work Exposure and Computer Technician Program",
    description:
      "Continued early-stage work exposure and completed the final part of the Computer Technician program period listed in your education background.",
    side: "left",
  },
  {
    year: "2011",
    title: "Started BS Information Technology",
    description:
      "Began your Bachelor of Science in Information Technology at Jose Rizal University, marking the formal start of your IT career path.",
    side: "right",
  },
  {
    year: "2012",
    title: "Academic Foundation in IT",
    description:
      "Focused on building your academic foundation in information technology and technical problem-solving through your BSIT studies. Needs confirmation for any specific milestone not stated in the resume.",
    side: "left",
  },
  {
    year: "2013",
    title: "Continued IT Studies",
    description:
      "Continued strengthening your IT foundation through formal education. Needs confirmation for specific projects or activities not listed in the resume.",
    side: "right",
  },
  {
    year: "2014",
    title: "IT Staff (OJT) at GG&A Clubshares Brokers Inc.",
    description:
      "Worked as an IT Staff (OJT) at GG&A Clubshares Brokers Inc., providing hardware and software support for Linux- and Windows-based systems while still in your academic journey.",
    side: "left",
  },
  {
    year: "2015",
    title: "Graduation and Encoder Role",
    description:
      "Completed your BS in Information Technology and worked as an Encoder at ThermaPrime Well Services Inc. You developed Excel-based database systems with macros, queries, and pivot tables for contractor costing, showing early strength in data handling and process support.",
    side: "right",
  },
  {
    year: "2016",
    title: "IT & Broadcast Engineer at Go Motion Production",
    description:
      "Joined Go Motion Production as an IT & Broadcast Engineer. Began supporting IT infrastructure and broadcast operations, including servers, shared storage, networks, and technical support for production teams.",
    side: "left",
  },
  {
    year: "2017",
    title: "Infrastructure and Network Experience",
    description:
      "Continued building hands-on expertise in infrastructure, network layout, Active Directory, storage systems, and production software support in a media and broadcast environment.",
    side: "right",
  },
  {
    year: "2018",
    title: "Expanded Broadcast IT Operations",
    description:
      "Expanded responsibilities in production IT operations, supporting editors, colorists, rendering systems, CCTV, and internal technical environments while helping maintain uninterrupted broadcast workflows.",
    side: "left",
  },
  {
    year: "2019",
    title: "Infrastructure Reliability and Access Control",
    description:
      "Strengthened practical experience in on-premise infrastructure, Synology NAS deployment, user access control, and troubleshooting across hardware, software, and networks.",
    side: "right",
  },
  {
    year: "2020",
    title: "Completed Broadcast Engineer Tenure",
    description:
      "Completed the later stage of your IT & Broadcast Engineer tenure, with continued focus on infrastructure reliability, broadcast support, internal systems, and production operations.",
    side: "left",
  },
  {
    year: "2021",
    title: "Application System Engineer at Fujitsu Philippines",
    description:
      "Moved into a more software-focused role as Application System Engineer at Weserv System International Inc. (Fujitsu Philippines). Worked on a Location Mapping Application using React, Python (Django), and PostgreSQL in collaboration with US- and Japan-based teams.",
    side: "right",
  },
  {
    year: "2022",
    title: "Application Development and System Improvement",
    description:
      "Continued application development and system improvement work, maintaining backend APIs and frontend components, optimizing production systems built with Ruby on Rails and JavaScript, and improving application reliability.",
    side: "left",
  },
  {
    year: "2023",
    title: "Transition to JPMorgan Chase & Co.",
    description:
      "Completed your Fujitsu role and transitioned to JPMorgan Chase & Co. as Associate - Process Improvement (Python Developer) in October. This marked a major career shift into Python-led automation, dashboards, internal tools, and data workflow modernization.",
    side: "right",
  },
  {
    year: "2024",
    title: "Automation, Dashboards, and Snowflake Workflows",
    description:
      "Built and maintained end-to-end Python applications for internal automation, created dashboards for user access and ticket monitoring, automated Snowflake data extraction, replaced legacy Alteryx and ClickView workflows, and supported production deployments with DevOps and AWS pipelines.",
    side: "left",
  },
  {
    year: "2025",
    title: "Advanced Python Automation and AI Exposure",
    description:
      "Continued advancing as a Python developer focused on automation, reporting pipelines, SAP data extraction, scheduler-based report delivery, Snowflake integration, and management dashboards with near real-time operational visibility. Resume also shows growing exposure to OpenAI APIs, RAG, Hugging Face-hosted models, and Amazon Bedrock-related concepts.",
    side: "right",
  },
];

export default function JourneyTimeline() {
  return (
    <section className="container-page section-shell">
      <div className="mx-auto max-w-5xl">
        <div className="section-header items-center text-center">
          <div className="section-eyebrow">Journey</div>
          <h2 className="type-section-title section-title font-normal text-white/95">
            Career timeline
          </h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white/12 md:block" />

          <div className="space-y-10">
            {timeline.map((item) => (
              <div
                key={item.year}
                className={`flex w-full ${
                  item.side === "left" ? "md:justify-start" : "md:justify-end"
                }`}
              >
                <div className="section-panel w-full p-7 md:w-[44%]">
                  <div className="flex items-start justify-between gap-6">
                    <div className="type-journey-year font-normal text-white/95">{item.year}</div>
                    <div className="type-card-title pt-2 text-right font-normal text-white/90">
                      {item.title}
                    </div>
                  </div>

                  <p className="type-card-body mt-5 leading-8 text-white/60">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-white/70 shadow-[0_0_30px_rgba(255,255,255,0.35)] md:block" />
        </div>
      </div>
    </section>
  );
}
