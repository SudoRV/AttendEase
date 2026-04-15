import { useRef, useState } from "react";
import { AppStates } from "../services/states";
import Select from "react-select";


export default function Announce() {

    const formRef = useRef(HTMLFormElement);
    const [loading, setLoading] = useState(false);
    const { userData } = AppStates();
    const [targetYears, setTargetYears] = useState([]);
    const [targetBranches, setTargetBranches] = useState([]);
    const [targetSections, setTargetSections] = useState([]);

    async function handleAnnounce(e) {
        e.preventDefault();

        const form = new FormData(formRef.current);
        const formData = Object.fromEntries(form.entries());
        formData.created_by = {
            name: userData?.name,
            id: userData?.teacher_id
        };
        // add target
        formData.target_year = targetYears;
        formData.target_branch = targetBranches;
        formData.target_section = targetSections;
        formData.status = "Active";

        setLoading(true);
        // upload to server 
        const response = await fetch("/announce", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })

        const res_data = await response.json();
        console.log(res_data);
        if (res_data.success) {
            setLoading(false);
            e.target.reset();
        }
    }

    return (
        <div className="announcer">
            <h3 className="headings">Announcement</h3>
            <form ref={formRef} onSubmit={handleAnnounce}>
                <div>
                    <div className="">
                        <label className="label">Title</label><br />
                        <input className="input-box" name="title" placeholder="title..." />
                    </div>

                    <div className="!mt-4">
                        <label className="label">Body</label><br />
                        <input className="input-box" name="body" placeholder="body..." />
                    </div>
                </div>

                <p className="label !mt-4">Target</p>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 gap-y-3">
                    <Select
                        className="w-full"
                        isMulti
                        closeMenuOnSelect={false}
                        placeholder="Year(s)"
                        options={[
                            { value: "all", label: "All" },
                            { value: "1", label: "1st Year" },
                            { value: "2", label: "2nd Year" },
                            { value: "3", label: "3rd Year" },
                            { value: "4", label: "4th Year" }
                        ]}

                        value={targetYears.map(y => ({
                            value: y,
                            label:
                                y === "1" ? "1st Year" :
                                    y === "2" ? "2nd Year" :
                                        y === "3" ? "3rd Year" :
                                            "4th Year"
                        }))}

                        onChange={(options) =>
                            setTargetYears(options ? options.map(o => o.value) : [])
                        }
                    />

                    <Select
                        className="w-full"
                        isMulti
                        closeMenuOnSelect={false}
                        placeholder="Select Branch(es)"
                        options={[
                            { value: "all", label: "All" },
                            { value: "CSE", label: "CSE" },
                            { value: "AI", label: "AI / ML" },
                            { value: "RA", label: "Robotics" },
                            { value: "ME", label: "ME" },
                            { value: "CE", label: "Civil" },
                            { value: "BCA", label: "BCA" }
                        ]}
                        onChange={(options) =>
                            setTargetBranches((options ?? []).map(o => o.value))
                        }
                    />

                    <Select
                        className="w-full"
                        isMulti
                        closeMenuOnSelect={false}
                        placeholder="Select Section(s)"
                        options={[
                            { value: "all", label: "All" },
                            { value: "A", label: "A" },
                            { value: "B", label: "B" },
                            { value: "C", label: "C" }
                        ]}
                        onChange={(options) =>
                            setTargetSections((options ?? []).map(o => o.value))
                        }
                    />

                </div>

                {/* expiry of announcement */}
                <div className="w-full mt-4 flex items-center">
                    <label className="label">Expires At: </label>
                    <input className="select-box flex-1" name="expires_at" type="datetime-local" />
                </div>

                <button
                    className="block button rounded-md !ml-auto !mt-6"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Announcing...' : 'Announce'}
                </button>
            </form>
        </div>
    )
}