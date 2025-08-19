"use client";
import * as React from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Input } from "@/components/starter_ui/input";
import Typography from "@/components/starter_ui/typography";
import Button from "@/components/starter_ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/starter_ui/form";
import { wait } from "@/lib/utils/waitSomeTime";
import { type ViewForm, viewFormSchema } from "@/lib/types/definitions";
import { Textarea } from "@/components/starter_ui/textarea";
import Select from "@/components/starter_ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/starter_ui/radio-group";
import { Checkbox } from "@/components/starter_ui/checkbox";
import DatePicker from "@/components/starter_ui/date-picker";
import { InputOTP } from "@/components/starter_ui/input-otp";
import { InputPlusMoins } from "@/components/starter_ui/input-plus-moins";
import { InputPhoneNumber } from "@/components/starter_ui/input-phone-number";
import { InputSelect } from "@/components/starter_ui/input-select";
import { InputAddTag } from "@/components/starter_ui/input-add-tag";
import { InputPaymentNumber } from "@/components/starter_ui/input-payment-number";
import { ImageUploader } from "@/components/starter_ui/upload-image";

export default function ViewForm() {
    const [isVisible, setIsVisible] = React.useState(false);
    const form = useForm<ViewForm>({
        resolver: zodResolver(viewFormSchema),
        defaultValues: {
            // image: null,
            username: "",
            email: "",
            password: "",
            value: 0,
            otp: "",
            tags: [],
            // card: {
            //   number: "",
            //   expiry_date: "",
            //   cvc: "",
            // },
            // card_number: "",
            bio: "",
            // selectedItem: "",
            singleCheckbox: false,
            multiCheckboxItems: [],
            radio: "all",
            birth: new Date(),
        },
    });

    const { isSubmitting, isValid } = form.formState;
    // console.log("data isSubmitting", isSubmitting, isValid);

    async function onSubmit(data: ViewForm) {
        console.log("data", data);

        // simulation d'attente : A supprimer en usage réel
        await wait(3000);
    }

    const checkboxItems = [
        {
            id: "recents_23",
            label: "Recents",
        },
        {
            id: "home",
            label: "Home",
        },
        {
            id: "applications",
            label: "Applications",
        },
        {
            id: "desktop",
            label: "Desktop",
        },
        {
            id: "downloads",
            label: "Downloads",
        },
        {
            id: "documents",
            label: "Documents",
        },
    ] as const;

    return (
        <>
            <section className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-2 border-b border-neutral-200">
                    <span>{"Form"}</span>
                </div>
                <div className="px-4 py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                            <fieldset className="space-y-4" disabled={isSubmitting}>
                                {/* -------Image Field------- */}
                                {/* <Form.Field
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        Image &nbsp;
                        <span className="text-[var(--text-brand-tertiary)] ">
                          {"*"}
                        </span>
                      </Form.Label>
                      <Form.Control>
                        <ImageUploader
                          uploadImage={field.value}
                          setUploadImage={field.onChange}
                        />
                      </Form.Control>
                      <Form.Description>
                        This is your public display name.
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                /> */}
                                {/* -------TextInput Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <Form.Item>
                                            <Form.Label>
                                                Username &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <Input placeholder="Your username" {...field} />
                                            </Form.Control>
                                            <Form.Description>
                                                This is your public display name.
                                            </Form.Description>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* -------Email Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                {"Adresse email"} &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <Input
                                                    type="email"
                                                    placeholder="Your email"
                                                    customSize={"sm"}
                                                    {...field}
                                                />
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* -------Password Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                {"Mot de passe"} &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <Input
                                                    type={isVisible ? "text" : "password"}
                                                    placeholder="......."
                                                    customSize={"sm"}
                                                    icon={{
                                                        position: "left",
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
                                                    {...field}
                                                />
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* -------Plus Ou Moins Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                {"Value"} &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <InputPlusMoins
                                                    customSize={"sm"}
                                                    onChange={field.onChange}
                                                />
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* -------OTP Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                {"One-Time Password"} &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <InputOTP length={4} onChange={field.onChange} />
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />
                                {/* -------Phone Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                {"Your Phone number"} &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <InputPhoneNumber
                                                    value={field.value}
                                                    setValue={field.onChange}
                                                    placeholder=""
                                                    customSize={"sm"}
                                                />
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />
                                {/* -------URL Field------- */}
                                {/* <Form.Field
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <Form.Item className="space-y-1.5">
                      <Form.Label>
                        {"Your URL"} &nbsp;
                        <span className="text-[var(--text-brand-tertiary)] ">
                          {"*"}
                        </span>
                      </Form.Label>
                      <Form.Control>
                        <InputSelect
                          type="text"
                          placeholder="..."
                          customSize={"sm"}
                          optionBoxPosition={"right"}
                          options={[
                            { id: 1, label: ".com" },
                            { id: 2, label: ".org" },
                            { id: 3, label: ".net" },
                            { id: 4, label: ".ci" },
                          ]}
                          onChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                /> */}
                                {/* -------Tags Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                {"Your URL"} &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <InputAddTag
                                                    type="text"
                                                    placeholder="Add tag"
                                                    customSize={"sm"}
                                                    tags={field.value}
                                                    setTags={field.onChange}
                                                />
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />
                                {/* -------Card Number Field------- */}
                                {/* <Form.Field
                  control={form.control}
                  name={"card_number"}
                  render={({ field }) => (
                    <Form.Item className="space-y-1.5">
                      <Form.Label>
                        {"Numéro de carte"}
                        &nbsp;
                        <span className="text-[var(--text-brand-tertiary)] ">
                          {"*"}
                        </span>
                      </Form.Label>
                      <Form.Control>
                        <InputPaymentNumber
                          cardNumber={field.value}
                          setCardNumber={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                /> */}

                                {/* -------Textarea Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                Bio &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <Textarea
                                                    placeholder="Tell us a little bit about yourself"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </Form.Control>
                                            <Form.Description>
                                                You can <span>@mention</span> other users and
                                                organizations.
                                            </Form.Description>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* <Form.Field
                  control={form.control}
                  name="selectedItem"
                  render={({ field }) => (
                    <Form.Item className="space-y-1.5">
                      <Form.Label>Select an item</Form.Label>
                      <Form.Control>
                        <Select
                          customSize="sm"
                          items={[
                            { label: "Football", value: "foo" },
                            { label: "Natation", value: "nat" },
                            { label: "Basket-ball", value: "bas" },
                            { label: "Volley-ball", value: "vol" },
                          ]}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                /> */}

                                {/* -------SingleCheckbox Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="singleCheckbox"
                                    render={({ field }) => (
                                        <Form.Item className="flex flex-row-reverse items-center space-x-1.5 justify-end">
                                            <Form.Label>
                                                J'accepte la politique de confidentialité &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </Form.Control>
                                        </Form.Item>
                                    )}
                                />

                                {/* -------MultiCheckbox Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="multiCheckboxItems"
                                    render={() => (
                                        <Form.Item className="space-y-4">
                                            <div className="mb-4">
                                                <Form.Label>
                                                    MultiCheckBox &nbsp;
                                                    <span className="text-[var(--text-brand-tertiary)] ">
                                                        {"*"}
                                                    </span>
                                                </Form.Label>
                                                <Form.Description>
                                                    Select the items you want to display in the
                                                    sidebar.
                                                </Form.Description>
                                            </div>
                                            {checkboxItems.map(item => (
                                                <Form.Field
                                                    key={item.id}
                                                    control={form.control}
                                                    name="multiCheckboxItems"
                                                    render={({ field }) => {
                                                        return (
                                                            <Form.Item
                                                                key={item.id}
                                                                className="flex flex-row-reverse items-center justify-end space-x-1.5"
                                                            >
                                                                <Form.Label className="text-sm font-normal">
                                                                    {item.label}
                                                                </Form.Label>
                                                                <Form.Control>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(
                                                                            item.id
                                                                        )}
                                                                        onCheckedChange={checked => {
                                                                            return checked
                                                                                ? field.onChange([
                                                                                      ...field.value,
                                                                                      item.id,
                                                                                  ])
                                                                                : field.onChange(
                                                                                      field.value?.filter(
                                                                                          value =>
                                                                                              value !==
                                                                                              item.id
                                                                                      )
                                                                                  );
                                                                        }}
                                                                    />
                                                                </Form.Control>
                                                            </Form.Item>
                                                        );
                                                    }}
                                                />
                                            ))}
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* -------RadioGroup Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="radio"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                Notify me about... &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col"
                                                >
                                                    <Form.Item className="flex items-center gap-3">
                                                        <Form.Control>
                                                            <RadioGroupItem value="all" />
                                                        </Form.Control>
                                                        <Form.Label className="font-normal">
                                                            All new messages
                                                        </Form.Label>
                                                    </Form.Item>
                                                    <Form.Item className="flex items-center gap-3">
                                                        <Form.Control>
                                                            <RadioGroupItem value="mentions" />
                                                        </Form.Control>
                                                        <Form.Label className="font-normal">
                                                            Direct messages and mentions
                                                        </Form.Label>
                                                    </Form.Item>
                                                    <Form.Item className="flex items-center gap-3">
                                                        <Form.Control>
                                                            <RadioGroupItem value="none" />
                                                        </Form.Control>
                                                        <Form.Label className="font-normal">
                                                            Nothing
                                                        </Form.Label>
                                                    </Form.Item>
                                                </RadioGroup>
                                            </Form.Control>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />

                                {/* -------Date Field------- */}
                                <Form.Field
                                    control={form.control}
                                    name="birth"
                                    render={({ field }) => (
                                        <Form.Item className="space-y-1.5">
                                            <Form.Label>
                                                Date of birth &nbsp;
                                                <span className="text-destructive/60 ">{"*"}</span>
                                            </Form.Label>
                                            <Form.Control>
                                                <DatePicker
                                                    mode="single"
                                                    selectedDate={field.value}
                                                    setSelectedDate={field.onChange}
                                                />
                                            </Form.Control>
                                            <Form.Description>
                                                Your date of birth is used to calculate your age
                                            </Form.Description>
                                            <Form.Message />
                                        </Form.Item>
                                    )}
                                />
                            </fieldset>
                            <div className="mt-6">
                                <Button
                                    variant={"default"}
                                    size={"md"}
                                    // disabled={!isValid || isSubmitting}
                                    isLoading={isSubmitting}
                                    className="w-full"
                                >
                                    {"Submit"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </section>
        </>
    );
}
