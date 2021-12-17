import { AccountTaskStatus, PaymentsAccountRecord } from "@karya/core";
import { BoxRouteMiddleware } from "../routes/BoxRoutes";
import { RegistrationQWrapper } from '../Queue/Registration/RegistrationQWrapper';
import { RegistrationQConfig } from '../Queue/Registration/RegistrationQConfig';
import * as HttpResponse from '@karya/http-response';
import { BasicModel } from "@karya/common";

export const addAccount: BoxRouteMiddleware = async (ctx) => {
    // TODO: Need to validate incoming request
    try {
        const accountRecord: PaymentsAccountRecord = ctx.request.body
        const registrationQWrapper = new RegistrationQWrapper(RegistrationQConfig)
        const qResult = await registrationQWrapper.enqueue(accountRecord.id, { 
            accountRecord: {...accountRecord, box_id: ctx.state.entity.id} 
        })
        HttpResponse.OK(ctx, qResult.createdAccountRecord)
    } catch (err) {
        // TODO: Handle different type of error and send appropriate response
        console.error(err)
        HttpResponse.InternalError(ctx, "Could not enqueue task. Something went wrong")
    }
       
}

export const verifyAccount: BoxRouteMiddleware = async (ctx) => {
    // TODO: Need to validate incoming request
    try {
        const updatedAccountRecord = await BasicModel.updateSingle('payments_account',
        { id: ctx.params.id }, { status: AccountTaskStatus.VERIFIED })
        HttpResponse.OK(ctx, updatedAccountRecord)
    } catch (err) {
        // TODO: Handle different type of error and send appropriate response
        console.error(err)
        HttpResponse.InternalError(ctx, "Could not update the account status. Something went wrong.")
    }

}