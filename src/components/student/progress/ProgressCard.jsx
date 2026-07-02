import Card from "@/components/ui/Card";
import ProgressBar from "../courses/ProgressBar";

export default function ProgressCard({
                                         enrollment,
                                     }) {
    const {course, progress} = enrollment;

    return (
        <Card className="p-5">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        {course.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        {course.instructor}
                    </p>
                </div>

                <ProgressBar value={progress}/>

                <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Progress
          </span>

                    <span className="font-semibold text-orange-500">
            {progress}%
          </span>
                </div>
            </div>
        </Card>
    );
}