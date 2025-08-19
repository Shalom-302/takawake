import ViewAspectRatio from "@/components/sections/_ui-view/view-aspect-ratio";
import ViewAvatar from "@/components/sections/_ui-view/view-avatar";
import ViewBadge from "@/components/sections/_ui-view/view-badge";
import ViewBreadcrumb from "@/components/sections/_ui-view/view-breadcrumb";
import ViewButton from "@/components/sections/_ui-view/view-button";
import ViewCalendar from "@/components/sections/_ui-view/view-calendar";
import ViewCard from "@/components/sections/_ui-view/view-card";
import ViewCheckbox from "@/components/sections/_ui-view/view-checkbox";
import ViewDatePicker from "@/components/sections/_ui-view/view-date-picker";
import ViewDialog from "@/components/sections/_ui-view/view-dialog";
import ViewDropdown from "@/components/sections/_ui-view/view-dropdown";
import ViewFileUpload from "@/components/sections/_ui-view/view-file-upload";
import ViewForm from "@/components/sections/_ui-view/view-form";
import ViewImageCropper from "@/components/sections/_ui-view/view-image-cropper";
import ViewInput from "@/components/sections/_ui-view/view-input";
import ViewLoading from "@/components/sections/_ui-view/view-loading-indicator";
import ViewPagination from "@/components/sections/_ui-view/view-pagination";
import ViewProgress from "@/components/sections/_ui-view/view-progress";
import ViewRadioGroup from "@/components/sections/_ui-view/view-radio-group";
import ViewReorder from "@/components/sections/_ui-view/view-reorder";
import ViewSelect from "@/components/sections/_ui-view/view-select";
import ViewSheet from "@/components/sections/_ui-view/view-sheet";
import ViewStep from "@/components/sections/_ui-view/view-step";
import ViewTab from "@/components/sections/_ui-view/view-tab";
import ViewTable from "@/components/sections/_ui-view/view-table";
import ViewTextarea from "@/components/sections/_ui-view/view-textarea";
import ViewTimeline from "@/components/sections/_ui-view/view-timeline";
import ViewToggle from "@/components/sections/_ui-view/view-toggle";
import ViewTooltip from "@/components/sections/_ui-view/view-tooltip";
import ViewTypography from "@/components/sections/_ui-view/view-typography";

export default function Home() {
    return (
        <>
            <div className="py-20 max-w-4xl space-y-6 mx-auto px-4">
                <ViewTypography />
                <ViewButton />
                <ViewBadge />
                <ViewDropdown />
                <ViewInput />
                <ViewTextarea />
                <ViewForm />
                <ViewToggle />
                <ViewCheckbox />
                <ViewRadioGroup />
                <ViewTooltip />
                <ViewProgress />
                <ViewBreadcrumb />
                <ViewLoading />
                <ViewFileUpload />
                <ViewCalendar />
                <ViewDatePicker />
                <ViewSelect />
                <ViewDialog />
                <ViewSheet />
                <ViewTab />
                <ViewAvatar />
                <ViewTable />
                <ViewStep />
                <ViewAspectRatio />
                <ViewTimeline />
                <ViewImageCropper />
                <ViewCard />
                <ViewReorder />
                <ViewPagination />
            </div>
        </>
    );
}
