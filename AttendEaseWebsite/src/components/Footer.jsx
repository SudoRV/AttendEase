import {
  FaGithub,
  FaLinkedin
} from "react-icons/fa";

const team = [
  {
    name: "Arindam",
    github: "Arindam-c-Pathak",
    linkedin: "https://www.linkedin.com/in/arindam-chandra-pathak/",
    role: "Frontend Developer"
  },
  {
    name: "Arjun Singh",
    github: "arjunsinghas0077-eng",
    linkedin: "",
    role: "Frontend Developer"
  },
  {
    name: "Rahul Verma",
    github: "SudoRV",
    linkedin: "https://www.linkedin.com/in/sudorv/",
    role: "Backend Developer"
  },
  {
    name: "Rituraj Kalkhudiya",
    github: "Riturajkalkhudiya",
    linkedin: "https://www.linkedin.com/in/rituraj-kalkhudiya-b32174315/",
    role: "Database Developer"
  },
  {
    name: "Vansh Verma",
    github: "vansh2709",
    linkedin: "https://www.linkedin.com/in/vansh-verma-ab318b304/",
    role: "Database Developer"
  },
];

export default function Footer() {
  return (
    <footer className="footer text-gray-700">
      {/* Credits*/}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-700">

        <div className="max-w-7xl mx-auto px-6 py-4">
          <h3 className="text-center text-gray-100 text-lg font-semibold mb-8">
            Project Credits
          </h3>

          <div className="gap-8 flex flex-row overflow-x-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="mx-auto flex flex-col items-center text-center gap-2"
              >
                {member.github ? (
                  <img
                    src={`https://github.com/${member.github}.png`}
                    alt={member.name}
                    className="w-20 h-20 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                    NA
                  </div>
                )}

                <p className="text-sm font-medium text-gray-100">
                  {member.name}
                </p>

                <p className="text-sm font-bold text-gray-100">
                  {member.role}
                </p>

                <div className="flex gap-3 text-sm text-gray-200">
                  {member.github && (
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-gray-900"
                    >
                      <FaGithub size={26} color="#dedede" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-600"
                    >
                      <FaLinkedin size={26} color="#dedede" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
