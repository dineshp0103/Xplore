export default function VerificationPage() {
    return (
        <div className="flex h-full flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Instructions */}
            <div className="w-full lg:w-1/2 flex flex-col border-r border-[#233648] bg-[#192633] overflow-y-auto">
                <div className="p-6 md:p-8 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Microservices Deployment Challenge</h2>
                        <p className="text-[#92adc9] leading-relaxed">
                            Configure and deploy a containerized microservices architecture. You need to demonstrate proficiency in Docker orchestration and CI/CD pipeline setup.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#137fec] text-lg">verified</span>
                            Skills to Verify
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge label="Docker Compose" />
                            <Badge label="Kubernetes" />
                            <Badge label="Github Actions" />
                            <Badge label="Nginx" />
                            <Badge label="AWS EC2" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#233648] pb-2">
                            <span className="material-symbols-outlined text-[#92adc9]">description</span>
                            <h3 className="text-lg font-semibold text-white">Problem Statement</h3>
                        </div>
                        <div className="text-[#92adc9] text-sm space-y-4">
                            <p>
                                The current monolithic application needs to be refactored into three separate services:
                                <CodeSpan>auth-service</CodeSpan>, <CodeSpan>user-service</CodeSpan>, and <CodeSpan>product-service</CodeSpan>.
                            </p>
                            <p>Your task is to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Create Dockerfiles for each service.</li>
                                <li>Write a <span className="text-white font-mono">docker-compose.yml</span> to orchestrate local development.</li>
                                <li>Configure an Nginx reverse proxy to route traffic.</li>
                                <li>Implement a health check endpoint for the load balancer.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-[#111a22] rounded-xl border border-[#233648] p-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Technical Requirements</h3>
                        <div className="space-y-3">
                            <Requirement label="Services must communicate over an internal Docker network." checked />
                            <Requirement label="Environment variables must be used for sensitive configuration." />
                            <Requirement label="Total image size for production builds should not exceed 500MB." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Submission & Terminal */}
            <div className="w-full lg:w-1/2 flex flex-col bg-[#101922] overflow-y-auto">
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Proof of Work</h2>
                        <span className="text-xs text-[#92adc9] flex items-center gap-1">
                            <span className="size-2 rounded-full bg-[#00d26a] animate-pulse"></span>
                            Environment Active
                        </span>
                    </div>

                    {/* GitHub URL Input */}
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-[#92adc9] mb-2 uppercase tracking-wide">GitHub Repository URL</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-[#92adc9] material-symbols-outlined text-lg">link</span>
                                <input
                                    type="text"
                                    defaultValue="https://github.com/alex-m/microservices-challenge"
                                    className="w-full pl-10 bg-[#111a22] border border-[#233648] rounded-lg py-2 text-white text-sm focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] placeholder-[#92adc9]/50 focus:outline-none"
                                    placeholder="https://github.com/username/repo-name"
                                />
                            </div>
                            <button className="bg-[#233648] hover:bg-[#2d465e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#344d66]">
                                Link
                            </button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-[#92adc9] mb-2 uppercase tracking-wide">Project Artifacts</label>
                        <div className="mt-3 flex items-center justify-between bg-[#192633] border border-[#233648] p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#137fec]">folder_zip</span>
                                <div>
                                    <p className="text-sm text-white font-medium">project-v1.zip</p>
                                    <p className="text-xs text-[#92adc9]">4.2 MB • Uploaded just now</p>
                                </div>
                            </div>
                            <button className="text-[#92adc9] hover:text-red-400">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Terminal */}
                    <div className="flex-1 min-h-[250px] bg-[#0d1117] rounded-xl border border-[#233648] p-4 font-mono text-sm relative overflow-hidden flex flex-col mb-6">
                        <div className="flex items-center justify-between border-b border-[#233648] pb-2 mb-2">
                            <div className="flex gap-1.5">
                                <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="size-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="size-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                            <span className="text-xs text-[#92adc9]">xplore-cli — -zsh — 80x24</span>
                        </div>
                        <div className="flex-1 overflow-y-auto text-[#92adc9] space-y-1 font-mono">
                            <p><span className="text-green-400">user@xplore-lab</span>:<span className="text-blue-400">~/project</span>$ docker-compose up -d</p>
                            <p className="text-gray-500">[+] Running 3/3</p>
                            <p className="text-gray-500"> ⠿ Network project_default     Created  <span className="float-right text-white">0.1s</span></p>
                            <p className="text-gray-500"> ⠿ Container auth-service      Started  <span className="float-right text-white">0.5s</span></p>
                            <p className="text-gray-500"> ⠿ Container user-service      Started  <span className="float-right text-white">0.4s</span></p>
                            <p><span className="text-green-400">user@xplore-lab</span>:<span className="text-blue-400">~/project</span>$ ./test_endpoints.sh</p>
                            <p className="text-white">Testing Auth Service... <span className="text-green-400">OK (200)</span></p>
                            <p className="text-white">Testing User Service... <span className="text-green-400">OK (200)</span></p>
                            <p><span className="text-green-400">user@xplore-lab</span>:<span className="text-blue-400">~/project</span>$ <span className="animate-pulse">_</span></p>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="mt-auto pt-6 border-t border-[#233648] flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-[#92adc9] uppercase tracking-wide">Validation cost</span>
                            <span className="text-sm font-bold text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-[#137fec] text-base">bolt</span>
                                50 Credits
                            </span>
                        </div>
                        <button className="bg-[#137fec] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 group">
                            <span className="material-symbols-outlined group-hover:animate-spin">smart_toy</span>
                            Verify Skills with AI
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function Badge({ label }: { label: string }) {
    return (
        <span className="px-3 py-1 rounded-full bg-[#233648] border border-[#344d66] text-xs text-white">
            {label}
        </span>
    );
}

function CodeSpan({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-white font-mono bg-[#233648] px-1 rounded">{children}</span>
    );
}

function Requirement({ label, checked }: { label: string; checked?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 min-w-[16px]">
                <span className={`material-symbols-outlined text-sm ${checked ? 'text-[#00d26a]' : 'text-[#92adc9]'}`}>
                    {checked ? 'check_circle' : 'radio_button_unchecked'}
                </span>
            </div>
            <p className="text-sm text-[#92adc9]">{label}</p>
        </div>
    );
}
