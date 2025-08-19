"use client";
import { AlertTriangle, EyeIcon, EyeOffIcon } from "@/components/icons";
import { Input } from "@/components/starter_ui/input";
import { InputAddTag } from "@/components/starter_ui/input-add-tag";
import { InputOTP } from "@/components/starter_ui/input-otp";
import { InputPayment } from "@/components/starter_ui/input-payment";
import { InputPaymentCvc } from "@/components/starter_ui/input-payment-cvc";
import { InputPaymentExpiryDate } from "@/components/starter_ui/input-payment-expiry-date";
import { InputPaymentNumber } from "@/components/starter_ui/input-payment-number";
import { InputPhoneNumber } from "@/components/starter_ui/input-phone-number";
import { InputPlusMoins } from "@/components/starter_ui/input-plus-moins";
import { InputSelect } from "@/components/starter_ui/input-select";
import Label from "@/components/starter_ui/label";
import { useState } from "react";
import { withMask } from "use-mask-input";

export default function ViewInput() {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const [phoneNumberValue, setPhoneNumberValue] = useState<string>("");

    const [val, setVal] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const [cardNumber, setCardNumber] = useState();
    const [expiryDate, setExpiryDate] = useState();
    const [cvc, setCvc] = useState();

    const [count, setCount] = useState(5);

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Input"}</span>
                </div>
                <div className="px-4 py-6 space-y-4">
                    <div className=" space-y-4 px-2 ">
                        <div className="space-y-2">
                            <Label htmlFor="pwd">
                                {"Your password"}
                                &nbsp;
                                <span className="text-destructive/60 ">{"*"}</span>
                            </Label>
                            <Input
                                type={isVisible ? "text" : "password"}
                                placeholder="..."
                                name="pwd"
                                id={"pwd"}
                                autoComplete="pwd"
                                customSize={"sm"}
                                aria-invalid={false}
                                icon={{
                                    position: "right",
                                    icon: isVisible ? (
                                        <div
                                            onClick={() => {
                                                setIsVisible(false);
                                            }}
                                        >
                                            <EyeOffIcon size={20} />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                setIsVisible(true);
                                            }}
                                        >
                                            <EyeIcon size={20} />
                                        </div>
                                    ),
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                {"Phone number"}
                                &nbsp;
                                <span className="text-destructive/60 ">{"*"}</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Only numbers"
                                name="phone"
                                id={"phone"}
                                autoComplete="phone"
                                customSize={"sm"}
                                aria-invalid={false}
                                ref={withMask("9999999999", {
                                    placeholder: "",
                                    showMaskOnHover: false,
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullname">
                                {"Fullname"}
                                &nbsp;
                                <span className="text-destructive/60 ">{"*"}</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="All my name"
                                name="fullname"
                                id={"fullname"}
                                autoComplete="fullname"
                                customSize={"sm"}
                                aria-invalid={false}
                                icon={{ position: "left", icon: <AlertTriangle size={20} /> }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullname_2">
                                {"Fullname"}
                                &nbsp;
                                <span className="text-destructive/60 ">{"*"}</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="All my name"
                                name="fullname"
                                id={"fullname_2"}
                                autoComplete="fullname"
                                customSize={"sm"}
                                aria-invalid={false}
                                icon={{ position: "right", icon: <AlertTriangle size={20} /> }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullname_2">
                                {"Fullname"}
                                &nbsp;
                                <span className="text-destructive/60 ">{"*"}</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="All my name"
                                name="fullname"
                                id={"fullname_3"}
                                autoComplete="fullname"
                                customSize={"sm"}
                                aria-invalid={false}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullname_4">
                                {"Fullname"}
                                &nbsp;
                                <span className="text-destructive/60 ">{"*"}</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="All my name here"
                                name="fullname"
                                id={"fullname_4"}
                                autoComplete="fullname"
                                customSize={"md"}
                                aria-invalid={"true"}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullname_4">{"Secure code"}</Label>
                            <InputOTP
                                length={4}
                                className={"w-16 h-16 block text-center text-xl"}
                                onChange={val => console.log("Code OTP:", val)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <InputPhoneNumber
                            value={phoneNumberValue}
                            setValue={setPhoneNumberValue}
                            placeholder=""
                            customSize={"sm"}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="info">
                            {"Your Url"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        <InputSelect
                            type="text"
                            placeholder="..."
                            name="info"
                            id={"info"}
                            autoComplete="info"
                            customSize={"sm"}
                            aria-invalid={false}
                            optionBoxPosition={"right"}
                            options={[
                                { id: 1, label: ".com" },
                                { id: 2, label: ".org" },
                                { id: 3, label: ".net" },
                                { id: 4, label: ".ci" },
                            ]}
                            onChange={(e: any) => setVal(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="info">
                            {"Your Url"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        <InputSelect
                            type="text"
                            placeholder="..."
                            name="info"
                            id={"info"}
                            autoComplete="info"
                            customSize={"sm"}
                            aria-invalid={false}
                            optionBoxPosition={"left"}
                            options={[
                                { id: 1, label: "https://" },
                                { id: 2, label: "http://" },
                            ]}
                            onChange={(e: any) => setVal(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="addTag">
                            {"Creation"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        <InputAddTag
                            type="text"
                            placeholder="Add tag"
                            name="addTag"
                            id={"addTag"}
                            autoComplete="addTag"
                            customSize={"sm"}
                            aria-invalid={false}
                            tags={tags}
                            setTags={setTags}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account_one">
                            {"Informations de carte"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        {/* <InputPayment
                            id={"account_one"}
                            setCardNumber={setCardNumber}
                            setExpiryDate={setExpiryDate}
                            setCvc={setCvc}
                        /> */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card_number">
                            {"Numéro"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        {/* <InputPaymentNumber id={"card_number"} setCardNumber={setCardNumber} /> */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card_cvc">
                            {"Expiry date"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        {/* <InputPaymentExpiryDate id={"card_cvc"} setExpiryDate={setExpiryDate} /> */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card_cvc">
                            {"CVC"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        {/* <InputPaymentCvc id={"card_cvc"} setCvc={setCvc} /> */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card_cvc">
                            {"Value"}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        <InputPlusMoins customSize={"sm"} id={"addingVal"} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card_cvc">
                            {"Value with default "}
                            &nbsp;
                            <span className="text-destructive/60 ">{"*"}</span>
                        </Label>
                        <InputPlusMoins customSize={"sm"} defaultValue={20} id={"defVal"} />
                    </div>
                </div>
            </section>
        </>
    );
}
