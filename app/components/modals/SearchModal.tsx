'use client'

import useSearchModal from "@/app/hooks/useSearchModal"
import qs from 'query-string';
import Modal from "./Modal"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { Range } from "react-date-range"
import dynamic from "next/dynamic"
import CountrySelect, { CountrySelectValue } from "../inputs/CountrySelect"
import { formatISO } from "date-fns";
import Heading from "../Heading";
import Calendar from "../inputs/Calendar";
import Counter from "../inputs/Counter";

enum STEPS {
    LOCATION = 0,
    DATE = 1,
    INFO = 2,
}

const SearchModal = () => {
    const router = useRouter()
    const params = useSearchParams()

    const {isSearchModalOpen ,openSearchModal, closeSearchModal} = useSearchModal()

    const [location, setLocation] = useState<CountrySelectValue>()
    const [step, setStep] = useState(STEPS.LOCATION)
    const [guestCount, setGuestCount] = useState(1)
    const [roomCount, setRoomCount] = useState(1)
    const [bathroomCount, setBathroomCount] = useState(1)
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    })

    const Map = useMemo(() => dynamic(() => import('../Map'), {
        ssr: false
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }),[location])

    // handle previous step
    const onPreviousStep = useCallback(() => {
        if(step === STEPS.LOCATION) {
            closeSearchModal()
        } else {
            setStep((step) => (step - 1))
        }
    },[ step, closeSearchModal ])

    // handle next step
    const onNextStep = useCallback(() => {
            setStep(step + 1) 
    },[ step ])

    // handle submit
    const onSubmit = useCallback(() => {
        if (step !== STEPS.INFO) {
            return onNextStep()
        }
        let currentQuery = {}
        if (params){
            currentQuery = qs.parse(params.toString())
        }
        const updatedQuery: any = {
            ...currentQuery,
            locationValue: location?.value,
            guestCount,
            roomCount,
            bathroomCount,
        }
        if (dateRange.startDate) {
            updatedQuery.checkInDate = formatISO(dateRange.startDate)
        }
        if (dateRange.endDate) {
            updatedQuery.checkOutDate = formatISO(dateRange.endDate)
        }
        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true, skipEmptyString: true })

        setStep(STEPS.LOCATION)
        closeSearchModal()

        router.push(url)
    }, [ step,
         onNextStep,
         params,
         location,
         guestCount,
         roomCount,
         bathroomCount,
         dateRange,
         closeSearchModal,
         router ])

         // action label
         const actionLabel = useMemo(() => {
                if( step === STEPS.INFO) {
                    return 'Search'
                }
                return 'Next'
         },[ step ])

         // secondary action label
         const secondaryActionLabel = useMemo(() => {
                if(step === STEPS.LOCATION) {
                    return 'Cancel'
                }
                return 'Back'
         },[ step ])

         // body content
         let bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Where are you going?"
                    subtitle="Find the perfect place to stay"
                />
                <CountrySelect 
                    value={location}
                    onChange={(value) => setLocation(value as CountrySelectValue)}
                />
                <hr/>
                <Map center={location?.latlng}/>
            </div>
         )

        //  if step is info
            if(step === STEPS.INFO) {
                bodyContent = (
                    <div className="flex flex-col gap-8">
                        <Heading 
                            title="More information"
                            subtitle="Let's get to know your preferences better"
                        />
                        <Counter 
                            title="Guests"
                            subtitle="How many people are you bringing?"
                            value={guestCount}
                            onChange={(value) => setGuestCount(value)}
                        />
                         <Counter 
                            title="Rooms"
                            subtitle="How many rooms do you need?"
                            value={roomCount}
                            onChange={(value) => setRoomCount(value)}
                        />
                         <Counter 
                            title="Bathrooms"
                            subtitle="How many bathrooms do you need?"
                            value={bathroomCount}
                            onChange={(value) => setBathroomCount(value)}
                        />
                    </div>
                )
            }

            // if step is date
            if(step === STEPS.DATE) {
                bodyContent = (
                    <div className="flex flex-col gap-8">
                        <Heading 
                            title="When do you plan to go?"
                            subtitle="Make sure you don't miss out on any of the fun"
                        />
                        <Calendar 
                            dateRange={dateRange}
                            onChangeDateRange={(range) => setDateRange(range.selection)}
                        />
                    </div>
                )
            }

    return (
        <Modal 
            isOpen={isSearchModalOpen}
            onClose={closeSearchModal}
            onSubmit={onSubmit}
            title="Filters"
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={onPreviousStep}
            body={bodyContent}
        />
    )
}

export default SearchModal