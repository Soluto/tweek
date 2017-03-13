import * as ContextService from '../../../../services/context-service';

export default function (partitions) {
    const validPartitions = ContextService.getProperties().map(x => x.id);

    const invalidPartition = partitions.filter(p => !validPartitions.includes(p));
    const isValid = invalidPartition.length == 0;

    return { isValid, hint: !isValid ? 'Invalid partition' : undefined };
};
