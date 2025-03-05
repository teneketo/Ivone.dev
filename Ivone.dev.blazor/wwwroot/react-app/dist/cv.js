import{j as e,b as r,R as l}from"./client.js";const c=()=>e.jsxs("header",{className:"heading-section",children:[e.jsx("div",{className:"details-name",children:"Ivo Nedev"}),e.jsx("a",{href:"mailto:inedev1@gmail.com",children:e.jsx("div",{className:"email-me",children:"e-mail me"})})]}),o=["ASP.NET","JavaScript","Bootstrap","Blazor Mobile (Learning)",".NET Core","Web APIs","IIS","Azure (Learning)","EF","Ajax","HTML5","React (Learning)","TSQL","MySQL","CSS3","Blazor (Learning)","MVC","Android (native)"],t=()=>e.jsxs("section",{className:"skills-wrap",children:[e.jsx("h2",{className:"heading",children:"SKILLS"}),e.jsx("div",{className:"skills",children:o.map((s,i)=>e.jsxs("div",{className:"skill",children:[e.jsx("span",{className:"dot",children:"•"}),e.jsx("span",{className:"title",children:s})]},i))})]}),d=[{company:"United Learning",location:"Peterborough, UK",period:"Mar 2018 - Present",title:"Full-Stack Web Developer",description:"A group of 100 schools improving education nationwide.",responsibilities:["Led a team to build an industry-leading Curriculum SPA using .NET Core, MVC, SQL Server, React, and Azure apps.","Reduced operation time by 15% by implementing new features.","Developed an online education platform used by 60,000+ pupils during COVID.","Expanded access for 10,000+ external teachers."]},{company:"Quals-Direct",location:"Manchester, UK",period:"Aug 2014 - Mar 2018",title:"Software Developer",description:"Leading UK ePortfolio provider with 100,000+ learners.",responsibilities:["Migrated legacy VB app to .NET MVC, reducing runtime by 50%.","Resolved 45+ monthly feature requests & bugs, improving customer satisfaction.","Enhanced security, preventing fraud for a key client."]}],m=()=>e.jsxs("section",{children:[e.jsx("h2",{className:"professional-experience",children:"PROFESSIONAL EXPERIENCE"}),d.map((s,i)=>e.jsxs("div",{className:"job",children:[e.jsxs("div",{className:"job-heading",children:[e.jsxs("div",{className:"job-title",children:[s.company," ",e.jsx("span",{className:"job-location",children:s.location})]}),e.jsx("div",{className:"job-duration",children:s.period})]}),e.jsx("div",{className:"employer-description",children:s.description}),e.jsx("div",{className:"employer-position",children:s.title}),e.jsx("ul",{className:"job-points",children:s.responsibilities.map((a,n)=>e.jsx("li",{children:a},n))})]},i))]}),p=[{name:"https://gtaguessr.com/",role:"Owner",period:"Feb 2021 - Present"},{name:"Mobile Apps",role:"Developer",period:"Jul 2011 - Present"}],h=()=>e.jsxs("section",{children:[e.jsx("h2",{className:"professional-experience",children:"PERSONAL PROJECTS"}),p.map((s,i)=>e.jsxs("div",{className:"job",children:[e.jsxs("div",{className:"job-heading",children:[e.jsx("div",{className:"job-title",children:s.name}),e.jsx("div",{className:"job-duration",children:s.period})]}),e.jsx("div",{className:"employer-position",children:s.role})]},i))]}),j=()=>e.jsxs("section",{children:[e.jsx("h2",{className:"professional-experience",children:"EDUCATION"}),e.jsxs("div",{className:"job",children:[e.jsxs("div",{className:"job-heading",children:[e.jsxs("div",{className:"job-title",children:["University of Salford ",e.jsx("span",{className:"job-location",children:"Manchester, UK"})]}),e.jsx("div",{className:"job-duration",children:"Sep 2011 - Jun 2014"})]}),e.jsx("div",{className:"employer-description",children:"BSc in Computer Science"})]})]}),x=()=>e.jsxs("div",{className:"cv",children:[e.jsx(c,{}),e.jsx("div",{className:"cv-wrap",children:e.jsxs("div",{className:"main-section",children:[e.jsx(t,{}),e.jsx(m,{}),e.jsx(h,{}),e.jsx(j,{})]})})]});r.createRoot(document.getElementById("cv-root")).render(e.jsx(l.StrictMode,{children:e.jsx(x,{})}));
